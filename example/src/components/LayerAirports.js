import React, { Component } from 'react'
import { LayerGroup } from 'react-leaflet'
import MarkerAirport from './MarkerAirport'

export default class LayerAirports extends Component {
  render () {
    return (
      <LayerGroup>
        {this.props.features.map((feature) => {
          const { id } = feature.properties
          return <MarkerAirport {...feature} key={id} />
        })}
      </LayerGroup>
    )
  }
}
