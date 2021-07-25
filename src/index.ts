import { Model, Models, Plugin, RematchStore } from '@rematch/core'
import { shallowEqual } from 'react-redux'
import {
  Callback,
  GetDependencies,
  SubscribeConfig,
  Subscriptions,
} from './types'

// @ts-ignore
const validateConfig = (config: SubscribeConfig): void => {
  if (process.env.NODE_ENV !== 'production') {
    // do some stuffs.
  }
}

const validateSubscriptions = (subscriptions: any): void => {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof subscriptions !== 'function') {
      throw new Error('subscriptions should be a function.')
    }
  }
}

const validateSubscribeItem = (callback: unknown, getDependencies: unknown) => {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof callback !== 'function') {
      throw new Error('subscribe first argument should be a function.')
    }

    if (
      typeof getDependencies !== 'function' &&
      typeof getDependencies !== 'undefined'
    ) {
      throw new Error('subscribe second argument should be a function.')
    }
  }
}

const lazyExecuteByRAF = () => {
  const workInProgress = new Map()
  function rafLoop() {
    requestAnimationFrame(() => {
      workInProgress.forEach(value => {
        if (typeof value === 'function') {
          value()
        }
      })
      workInProgress.clear()
      rafLoop()
    })
  }

  function push(callback: Callback, wrapperCallback: () => void) {
    workInProgress.set(callback, wrapperCallback)
  }
  return {
    rafLoop,
    push,
  }
}

const makeSubscribe = <TModels extends Models<TModels>>(
  callback: Callback,
  getDependencies: GetDependencies
) => {
  validateSubscribeItem(callback, getDependencies)
  return {
    callback,
    getDependencies,
    dependencies: null,
  }
}

const createSubscribePlugin = <
  TModels extends Models<TModels>,
  TExtraModels extends Models<TModels> = Record<string, any>
>(
  config: SubscribeConfig = {}
): Plugin<TModels, TExtraModels> => {
  validateConfig(config)

  const subscriptionsCache: Subscriptions = new Map()

  const initDependencies = (store: RematchStore<TModels, TExtraModels>) => {
    subscriptionsCache.forEach((handlers, name) => {
      handlers.forEach(handler => {
        const { getDependencies } = handler
        handler.dependencies = getDependencies
          ? getDependencies(store.getState()[name], store)
          : undefined
      })
    })
  }

  const { rafLoop, push } = lazyExecuteByRAF()

  return {
    onModel(model: Model<TModels>) {
      const { name, subscriptions: collectSubscriptions } = model

      if (!name) {
        return
      }

      if (!collectSubscriptions) {
        return
      }

      validateSubscriptions(collectSubscriptions)

      collectSubscriptions(
        (callback: Callback, getDependencies: GetDependencies) => {
          const old = subscriptionsCache.get(name) || []
          const newOne = old?.concat([makeSubscribe(callback, getDependencies)])
          subscriptionsCache.set(name, newOne)
        }
      )
    },

    onStoreCreated(store: RematchStore<TModels, TExtraModels>) {
      initDependencies(store)

      rafLoop()

      store.subscribe(() => {
        subscriptionsCache.forEach((handlers, name) => {
          handlers.forEach(handler => {
            const { callback, getDependencies, dependencies } = handler
            const state = store.getState()
            const newDependencies = getDependencies
              ? getDependencies(state[name], store)
              : undefined

            if (
              !!getDependencies &&
              shallowEqual(dependencies, newDependencies)
            ) {
              return
            }

            const dispatcher = store.dispatch

            push(callback, () => callback(state, dispatcher, store))
            handler.dependencies = newDependencies
          })
        })
      })
    },
  }
}

export default createSubscribePlugin
