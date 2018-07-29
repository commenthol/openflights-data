const {Router} = require('express')
const {featureCollection} = require('@turf/helpers')
const MapLRU = require('map-lru').default

const {loadData} = require('./data.js')
const {insideBounds} = require('./geo.js')
const httpError = require('./httpError.js')
const filterFeatures = require('./filterFeatures.js')

const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const toUpperCase = (str = '') => str.toUpperCase()

/**
 * ...
 */
function setup (config = {}) {
  const router = new Router()
  const cache = new MapLRU(config.cacheSize || 10000)

  // load data async
  let data
  loadData(config).then(d => {
    data = d
  })

  // ---- middlewares ----
  const getCache = (req, res, next) => {
    const {body, statusCode} = cache.get(req.url) || {}
    res.setHeader('X-Cache', body || statusCode ? 'HIT' : 'MISS')
    res.body = body
    if (statusCode) res.statusCode = statusCode
    const err = statusCode >= 400 ? httpError(statusCode) : undefined
    next(err)
  }
  const setCache = (req, res, next) => {
    const {body} = res
    const statusCode = !body ? 404 : undefined
    const err = statusCode && httpError(statusCode)
    cache.set(req.url, {body, statusCode})
    next(err)
  }
  const mwAirlineCode = type => (req, res, next) => {
    let {code} = req.params
    code = toUpperCase(code)
    let airline = res.body
    if (!airline) {
      for (let f of data.airlines) {
        if (f[type] === code) {
          airline = f
          break
        }
      }
    }
    res.body = airline
    next()
  }

  // check that data is loaded
  router.use((req, res, next) => {
    // data shall be loaded
    if (data) next()
    else next(httpError(500))
  })

  router.get(['/airports/*', '/airlines/*'], getCache)

  router.get('/airports/bbox/:northwest/:southeast', (req, res, next) => {
    if (!res.body) {
      const {northwest, southeast} = req.params
      const bounds = [northwest, southeast].join(',')
      const _features = filterFeatures(req.query)(data.features)
      res.body = insideBounds(bounds, _features)
      if (!res.body.features.length) {
        res.body = undefined
      }
    }
    next()
  })
  router.get('/airports/search/:search', (req, res, next) => {
    if (!res.body) {
      const {search} = req.params
      const reSearch = new RegExp(escapeRegExp(search), 'i')
      const _features = data.features.filter(f =>
        reSearch.test(f.properties.name)
      )
      res.body = featureCollection(_features)
      if (!res.body.features.length) {
        res.body = undefined
      }
    }
    next()
  })
  router.get('/airports/iata/:code', (req, res, next) => {
    if (!res.body) {
      const {code} = req.params
      res.body = data.iata[toUpperCase(code)]
    }
    next()
  })
  router.get('/airports/icao/:code', (req, res, next) => {
    if (!res.body) {
      const {code} = req.params
      res.body = data.icao[toUpperCase(code)]
    }
    next()
  })

  router.get('/airlines/iata/:code', mwAirlineCode('iata'))
  router.get('/airlines/icao/:code', mwAirlineCode('icao'))
  router.get('/airlines/callsign/:code', mwAirlineCode('callsign'))
  router.get('/airlines/country/:code', mwAirlineCode('code'))
  router.get('/airlines/search/:search', (req, res, next) => {
    const {search} = req.params
    let airlines = res.body
    if (!airlines) {
      const reSearch = new RegExp(escapeRegExp(search), 'i')
      airlines = data.airlines.filter(f => reSearch.test(f.name))
    }
    res.body = airlines.length ? airlines : undefined
    next()
  })

  router.get(['/airports/*', '/airlines/*'], setCache)

  router.use((req, res) => {
    res.json(res.body)
  })

  return router
}

module.exports = setup
