export const cart = {
  state: [],
  reducers: {
    add: (cart, added) => [...cart, added],
    remove: (cart, removed) => cart.filter(item => item.id !== removed.id),
  },
  selectors: slice => ({
    total() {
      return slice(cart => cart.reduce((t, item) => t + item.value, 0))
    },
    items() {
      return slice
    },
  }),
}

export const a = {
  state: {
    test1: 1,
    test2: 2,
  },
  reducers: {
    addTest1(s) {
      console.log('add test1 called')
      return { ...s, test1: s.test1 + 1 }
    },
    addTest2(s) {
      console.log('add test2 called')
      return { ...s, test1: s.test2 + 1 }
    },
  },
  subscriptions: subscribe => {
    subscribe(
      (s, dispatch) => {
        console.log(s)
        console.log('add times')
      },
      s => {
        return [s.a.test1, s.a.test2]
      }
    )
  },
}
