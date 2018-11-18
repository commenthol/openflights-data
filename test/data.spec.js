const assert = require('assert')
const log = require('debug')('test:data')
const { airports, toGeoJSON, indexIata, indexIcao, loadData } = require('../src/data')
const { insideBounds } = require('../src/geo')

describe('data', function () {
  const test = {}

  it('shall split data into list', function () {
    return airports(`${__dirname}/fixtures/airport.dat`).then(list => {
      log(list)
      assert.ok(Array.isArray(list))
      assert.deepStrictEqual(list[0], {
        alt: 5282,
        city: 'Goroka',
        iata: 'GKA',
        icao: 'AYGA',
        id: '1',
        lat: -6.081689834590001,
        lng: 145.391998291,
        name: 'Goroka Airport',
        tz: 'Pacific/Port_Moresby',
        country: 'PG',
        type: 'airport'
      })
      Object.assign(test, { list })
    })
  })

  it('shall convert data to geojson', function () {
    assert.ok(test.list, 'needs `list` from previous test')
    const features = toGeoJSON(test.list)
    log(features[0])
    assert.ok(Array.isArray(features))
    assert.deepStrictEqual(features[0], {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [145.391998291, -6.081689834590001]
      },
      properties: {
        id: '1',
        name: 'Goroka Airport',
        city: 'Goroka',
        iata: 'GKA',
        icao: 'AYGA',
        alt: 5282,
        tz: 'Pacific/Port_Moresby',
        country: 'PG',
        type: 'airport'
      }
    })
    Object.assign(test, { features })
  })

  it('shall index by iata codes', function () {
    assert.ok(test.features, 'needs `features` from previous test')
    const index = indexIata(test.features)
    // console.log(index)
    log(Object.keys(index))
    assert.deepStrictEqual(Object.keys(index), [ 'GKA', 'POM', 'UAK', 'GOH' ])
  })

  it('shall index by icao codes', function () {
    assert.ok(test.features, 'needs `features` from previous test')
    const index = indexIcao(test.features)
    // console.log(index)
    log(Object.keys(index))
    assert.deepStrictEqual(Object.keys(index), [ 'AYGA', 'AYPY', 'BGBW', 'BGGH', 'ZKSC' ])
  })

  it('shall get all airports within bounds', function () {
    assert.ok(test.features, 'needs `features` from previous test')
    const { features } = test
    const bounds = '61,-45,65,-52'
    const res = insideBounds(bounds, features)
    log('%j', res)
    assert.strictEqual(res.features.length, 2)
    assert.deepStrictEqual(res.features.map(f => f.properties.iata), ['UAK', 'GOH'])
  })

  it('shall not fail on bad bounds', function () {
    assert.ok(test.features, 'needs `features` from previous test')
    const { features } = test
    const bounds = 'aaaa'
    const res = insideBounds(bounds, features)
    log('%j', res)
    assert.strictEqual(res.features.length, 0)
  })

  it('shall get full data set', function () {
    return loadData().then(data => {
      // require('fs').writeFileSync(`${__dirname}/../o.json`, JSON.stringify(data, null, 2))
      assert.ok(Array.isArray(data.features))
      assert.ok(Array.isArray(data.airlines))
      assert.ok(typeof data.iata === 'object')
      assert.ok(typeof data.icao === 'object')
    })
  })
})
