import { Store } from 'femto-flux'

export class MapStore extends Store {
  constructor (dispatcher, { actions }) {
    super(dispatcher)
    Object.assign(this, {
      actions,
      state: {}
    })
  }

  getState () {
    return this.state
  }

  __onDispatch (action) {
    let hasChange = true
    const { actions } = this
    const { type, data } = action
    switch (type) {
      case this.actions.setBounds.type: {
        this.state.bounds = data
        this.actions.airportsBbox(data)
        break
      }
      case actions.airportsBbox.type: {
        this.state.airports = data
        break
      }
      default: {
        hasChange = false
      }
    }
    if (hasChange) this.__emitChange()
  }
}
