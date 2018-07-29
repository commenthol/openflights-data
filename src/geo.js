const {featureCollection} = require('@turf/helpers')
const bbox = require('@turf/bbox-polygon').default
const within = require('@turf/within')

const toPolygon = (bounds) => {
  const [lat1, lng1, lat2, lng2] = [].concat(bounds.split(','), 0, 0, 0, 0)
    .map(i => Number(i)).filter(i => !isNaN(i))
  const latmin = Math.min(lat1, lat2)
  const latmax = Math.max(lat1, lat2)
  const lngmin = Math.min(lng1, lng2)
  const lngmax = Math.max(lng1, lng2)
  return bbox([lngmin, latmin, lngmax, latmax])
}

const insideBounds = (bounds, features) => {
  const search = featureCollection([toPolygon(bounds)])
  const points = featureCollection(features)
  return within(points, search)
}

module.exports = {
  insideBounds,
  toPolygon
}
