import { init } from '@rematch/core'
import selectPlugin from '@rematch/select'
import describePlugin from 'rematch-subscriptions'
import * as models from './models'

console.log({ describePlugin })

export const store = init({
  models,
  plugins: [selectPlugin(), describePlugin()],
})

export const { select } = store

export default store
