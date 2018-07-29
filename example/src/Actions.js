import {Actions} from 'femto-flux'

export class MapActions extends Actions {
  constructor (dispatch, {url} = {}) {
    super(dispatch, {name: 'MapActions'})
    this.dispatchAsync = (payload) => setTimeout(() => dispatch(payload))
    this._url = url
  }
  setBounds (data) {
    const type = this.setBounds.type
    this.dispatchAsync({type, data})
  }
  airportsBbox (bounds) {
    if (!bounds) return
    const type = this.airportsBbox.type
    const toPoint = ({lat, lng}) => [lat, lng].map(a => a.toFixed(2)).join(',')
    const nw = toPoint(bounds.getNorthWest())
    const sw = toPoint(bounds.getSouthEast())
    if (!nw || !sw) return
    const url = `${this._url}/airports/bbox/${nw}/${sw}?type=airport&iata=1`
    fetch(url)
      .then(json)
      .then(data => this.dispatch({type, bounds, data}))
      .catch(err => this.dispatchAsync({type, bounds, err}))
  }
}

function json (res) {
  return res.ok
    ? res.json()
    : Promise.reject(new Error(res.status))
}
