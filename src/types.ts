import {
  Models,
  RematchRootState,
  RematchStore,
  RematchDispatch,
} from '@rematch/core'

export interface SubscribeConfig {}

export interface Handler {
  getDependencies: GetDependencies
  callback: Callback
  dependencies: unknown
}

export type Subscriptions = Map<string, Handler[]>

export type Callback = <
  TModels extends Models<TModels>,
  TExtraModels extends Models<TModels> = Record<string, any>
>(
  s: RematchRootState<TModels, TExtraModels>,
  dispatcher: RematchDispatch<TModels>,
  store: RematchStore<TModels, TExtraModels>
) => unknown

export type GetDependencies = <
  TModels extends Models<TModels>,
  TExtraModels extends Models<TModels> = Record<string, any>
>(
  s: RematchRootState<TModels, TExtraModels>,
  store: RematchStore<TModels, TExtraModels>
) => unknown[]

declare module '@rematch/core' {
  interface Model<TModels extends Models<TModels>, TState = any> {
    subscriptions?: (subscribe: Function) => void
  }
}
