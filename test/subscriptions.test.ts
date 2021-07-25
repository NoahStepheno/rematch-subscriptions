import { init } from '@rematch/core'
import subscribePlugin from '../src'

describe('subscriptions', () => {
  // it('should not throw if no subscriptions', () => {
  //   const a = {
  //     state: 2,
  //     reducers: {
  //       increment: (s: number): number => s + 1,
  //     },
  //   }

  //   const start = (): void => {
  //     init({
  //       models: { a },
  //       plugins: [subscribePlugin()],
  //     })
  //   }

  //   expect(start).not.toThrow()
  // })

  // it('should throw if any description it not a function', () => {
  //   const store = init({ plugins: [subscribePlugin()] })

  //   expect(() =>
  //     store.addModel({
  //       name: 'a',
  //       state: 2,
  //       subscriptions: {
  //         // @ts-ignore
  //         invalid: 42,
  //       },
  //     })
  //   ).toThrow()
  // })

  // it('callback should be called if describe some stuffs change once sync, when no getDependencies', () => {
  //   const callback = jest.fn()
  //   const store = init({
  //     models: {
  //       a: {
  //         state: 2,
  //         reducers: {
  //           increment: (s: number): number => s + 1,
  //         },
  //         subscriptions: describe => {
  //           describe(callback)
  //         },
  //       },
  //     },
  //     plugins: [subscribePlugin()],
  //   })
  //   store.dispatch.a.increment()
  //   expect(callback).toBeCalled()
  // })

  // it('callback should call one time if describe some stuffs change once sync, when got getDependencies.', () => {
  //   const callback = jest.fn()
  //   const getDependencies = jest.fn()
  //   const store = init({
  //     models: {
  //       a: {
  //         state: 2,
  //         reducers: {
  //           increment: (s: number): number => s + 1,
  //         },
  //         subscriptions: describe => {
  //           describe(callback, getDependencies)
  //         },
  //       },
  //     },
  //     plugins: [subscribePlugin()],
  //   })
  //   store.dispatch.a.increment()
  //   expect(callback).toHaveBeenCalledTimes(0)
  // })

  // it('getDependencies should call one times if describe some stuffs change once async.', () => {
  //   const callback = jest.fn()
  //   const getDependencies = jest.fn()
  //   const store = init({
  //     models: {
  //       a: {
  //         state: 2,
  //         reducers: {
  //           increment: (s: number): number => s + 1,
  //         },
  //         subscriptions: describe => {
  //           describe(callback, getDependencies)
  //         },
  //       },
  //     },
  //     plugins: [subscribePlugin()],
  //   })
  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       store.dispatch.a.increment()
  //       resolve(null)
  //     }, 1e3)
  //   }).then(() => {
  //     expect(getDependencies).toHaveBeenCalledTimes(2)
  //   })
  // })

  it('set only once when more then two dependencies changed.', () => {
    const callback = jest.fn(() => console.log('called'))
    const store = init({
      models: {
        a: {
          state: {
            test1: 1,
            test2: 1,
          },
          reducers: {
            setTest1(s) {
              return {
                ...s,
                test1: s.test1 + 1,
              }
            },
            setTest2(s) {
              return {
                ...s,
                test2: s.test2 + 1,
              }
            },
          },
          subscriptions: describe => {
            describe(callback, (s: any) => {
              return {
                test1: s.test1,
                test2: s.test2,
              }
            })
          },
        },
      },
      plugins: [subscribePlugin()],
    })
    store.dispatch.a.setTest1()
    store.dispatch.a.setTest2()
    requestAnimationFrame(() => {
      expect(callback).toBeCalledTimes(1)
    })
  })
})
