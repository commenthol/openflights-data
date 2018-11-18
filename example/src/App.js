import React, { Component } from 'react'
import { Context } from './Context'
import { MapContainer } from './components/MapContainer'
import './App.css'

class App extends Component {
  render () {
    return (
      <Context>
        <MapContainer />
      </Context>
    )
  }
}

export default App
