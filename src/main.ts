import * as state from './state'
import * as runner from './runner'

if (!state.IsPost) {
  runner.run()
} else {
  runner.post()
}
