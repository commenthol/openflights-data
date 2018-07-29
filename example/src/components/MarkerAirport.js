import React, {Component} from 'react'
import { Marker, Popup } from 'react-leaflet'

export default class MarkerAirport extends Component {
  shouldComponentUpdate () {
    return false
  }
  render () {
    const {geometry, properties} = this.props
    if (geometry.type !== 'Point') return null
    const [lng, lat] = geometry.coordinates
    const {name, iata, icao, type} = properties
    return (
      <Marker position={[lat, lng]}>
        <Popup>
          <span>{name}<br />{iata} {icao}<br />{type}</span>
        </Popup>
      </Marker>
    )
  }
}
