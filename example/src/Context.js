import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Dispatcher } from 'femto-flux'

import {MapActions} from './Actions'
import {MapStore} from './Store'

export class Context extends Component {
  constructor () {
    super()
    const dispatcher = new Dispatcher()
    const dispatch = (payload) => dispatcher.dispatch(payload)
    const actions = this.actions = new MapActions(dispatch, {url: 'http://localhost:3003/api'})
    this.store = new MapStore(dispatcher, {actions})
  }
  static childContextTypes = {
    store: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  }
  getChildContext () {
    return {
      store: this.store,
      actions: this.actions
    }
  }
  render () {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}
