import React, { Component } from 'react'
import { TileLayer } from 'react-leaflet'
import { MapBounds } from './MapBounds'
import { Context } from '../Context'
import LayerAirports from './LayerAirports'
import Delayed from '../Delayed'

const AIRPORTS = { type: 'FeatureCollection', features: [] }

export class MapContainer extends Component {
  static contextTypes = Context.childContextTypes

  constructor (props, context) {
    super(props, context)
    Object.assign(this, {
      state: { airports: { type: 'FeatureCollection', features: [] }, center: [51, 0] },
      delayed: new Delayed(),
      onBoundsChange: this.onBoundsChange.bind(this)
    })
  }
  componentDidMount () {
    this._token = this.context.store.addListener(this.onChange.bind(this))
  }
  componentWillUnmount () {
    this._token.remove()
  }
  onChange () {
    const {airports = AIRPORTS, bounds} = this.context.store.getState()
    this.setState({airports, bounds})
  }
  onBoundsChange ({bounds}) {
    this.delayed.trigger(() => {
      this.context.actions.setBounds(bounds)
    })
  }

  render () {
    const {features = []} = this.state.airports
    return (
      <MapBounds
        center={this.state.center}
        zoom={8}
        onBoundsChange={this.onBoundsChange}
      >
        <LayerAirports features={features} />
        <TileLayer
          attribution='&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
      </MapBounds>
    )
  }
}
