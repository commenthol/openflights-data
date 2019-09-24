const fs = require('fs')
const csv = require('csv-parser')
const _config = require('./config.js')
const iso3166en = require('i18n-iso-countries/langs/en.json').countries
const countryCorrMap = require('../data/countryCorr.js')
const log = require('./log.js')(':data')

const countryByName = Object.keys(iso3166en).reduce((o, code) => {
  const name = iso3166en[code]
  o[name] = code
  return o
}, Object.assign({}, countryCorrMap))

/**
 * loads a csv file
 * @param {String} filename
 * @param {Array} headers - header row of csv
 * @return {Promise} - {Array<Object>}
 */
function loadCsv (filename, headers) {
  const list = []
  return new Promise((resolve) => {
    fs.createReadStream(filename)
      .pipe(csv({ headers }))
      .on('data', row => {
        row = Object.keys(row).reduce((o, key) => {
          let v = row[key]
          v = (v && v !== '\\N') ? v : void 0
          if (v) o[key] = v
          return o
        }, {})
        list.push(row)
      })
      .on('end', () => resolve(list))
  })
}

function airlines (filename) {
  if (!filename) return Promise.resolve([])
  const headers = [
    'id',
    'name',
    'alias',
    'iata',
    'icao',
    'callsign',
    'country',
    'active'
  ]
  return loadCsv(filename, headers)
    .then(list => list.map(airline => {
      const code = countryByName[airline.country]
      airline.active = (airline.active === 'Y')
      if (code) {
        airline.country = code
      } else {
        log('INFO: airlines no country code found: %s : %s', airline.country, airline.name)
        delete airline.country
      }
      return airline
    }))
}

/**
 * loads airport data from files
 * @return {Promise} - {Array<Object>}
 */
function airports (filename, fnCountries) {
  if (!filename) return Promise.resolve([])
  const headers = [
    'id',
    'name',
    'city',
    'country',
    'iata',
    'icao',
    'lat',
    'lng',
    'alt',
    'tzOffset',
    'dst',
    'tz',
    'type',
    'extraColumn'
  ]
  return loadCsv(filename, headers)
    // filter out all airports without iata, icoa code
    .then(list => list
      .filter(airport => (airport.iata || airport.icao))
      .map(airportType)
      .map(airport => {
        const { country } = airport
        const code = countryByName[country]
        if (!code) log('ERROR: airports no country code found: %s', country)
        airport.country = code
        ;['dst', 'tzOffset'].forEach((p) => delete airport[p])
        ;['lat', 'lng', 'alt'].forEach((p) => { airport[p] = Number(airport[p]) })
        return airport
      })
    )
}

const _airPortTypes = [
  ['airbase', /(^RAF |^RNZAF |^RAAF |^RNAS |^CFB |air base|air force base|army\b|airbase|\baaf\b)/i],
  ['airport', /airport|aerodrome/i],
  ['heliport', /heliport/i],
  ['seaplane', /seaplane|waterdrome|hidroport/i],
  ['airfield', /air.*field|airpark|airstrip|aeroclub|field$|flugplatz/i],
  ['bus', /(bus station|bus terminal|bus stop|autobuses|megabus stop|busstasjonen|^bus\b|termibus|greyhound)/i],
  ['port', /\b(ferry|cruise|dock|pier|port)\b/i],
  ['station', /(station|railway|gare|bahnhof|hbf|Hauptbahnhof|BF|amtrack|Rail Terminal|central|Centraal)\b/i]
]

function airportType (airport) {
  const { name, type } = airport
  if (type === 'unknown') delete airport.type
  for (let [type, regex] of _airPortTypes) {
    if (regex.test(name)) {
      airport.type = type
      return airport
    }
  }
  log('INFO: no type: %s', name)
  return airport
}

function toGeoJSON (list) {
  return list.map(item => {
    const { lat, lng, ...properties } = item
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      properties
    }
  })
}

function indexIata (geoFeatures) {
  return geoFeatures.reduce((o, geoFeature) => {
    const iata = geoFeature.properties.iata
    if (iata) o[iata] = geoFeature
    return o
  }, {})
}

function indexIcao (geoFeatures) {
  return geoFeatures.reduce((o, geoFeature) => {
    const icao = geoFeature.properties.icao
    if (icao) o[icao] = geoFeature
    return o
  }, {})
}

function loadData (config) {
  config = Object.assign({}, _config, config)

  return Promise.all([
    airports(config.airports),
    airlines(config.airlines)
  ]).then(([airports, airlines]) => {
    const features = toGeoJSON(airports)
    const iata = indexIata(features)
    const icao = indexIcao(features)
    return {
      features,
      iata,
      icao,
      airlines
    }
  })
}

module.exports = {
  loadCsv,
  airports,
  toGeoJSON,
  indexIata,
  indexIcao,
  loadData
}
