import React, { Component } from 'react'
import {Map} from 'react-leaflet'

export class MapBounds extends Component {
  componentDidMount () {
    this._onBoundsChange()
  }

  _onBoundsChange = () => {
    const {onBoundsChange} = this.props
    let bounds
    let zoom
    let center
    const leafletElement = this._ref && this._ref.leafletElement
    if (leafletElement) {
      bounds = leafletElement.getBounds()
      zoom = leafletElement.getZoom()
      center = leafletElement.getCenter()
    }
    onBoundsChange && onBoundsChange({bounds, zoom, center, leafletElement})
  }

  render () {
    const {children = null, ...other} = this.props
    return (
      <Map {...other}
        ref={el => { this._ref = el }}
        onViewportChange={this._onBoundsChange}
      >
        {children}
      </Map>
    )
  }
}
