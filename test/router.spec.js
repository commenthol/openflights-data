const assert = require('assert')
const express = require('express')
const request = require('supertest')
const { router } = require('..')

describe('router', function () {
  const app = express()
  app.use('/', router())
  app.use((err, req, res, next) => {
    // console.log(err)
    res.statusCode = err.status || 500
    res.json({ error: res.statusCode })
  })

  before(done => {
    setTimeout(done, 600) // need some time to load data
  })

  describe('airports', function () {
    it('shall get airport by IATA code', function () {
      return request(app)
        .get('/airports/iata/aaa')
        .expect(200)
        .expect({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-145.50999450683594, -17.35260009765625]
          },
          properties: {
            id: '1973',
            name: 'Anaa Airport',
            city: 'Anaa',
            iata: 'AAA',
            icao: 'NTGA',
            alt: 10,
            tz: 'Pacific/Tahiti',
            country: 'PF',
            type: 'airport',
            source: 'OurAirports'
          }
        })
    })
    it('shall not find airport by unknown IATA code', function () {
      return request(app)
        .get('/airports/iata/xxx')
        .expect(404)
    })
    it('shall get airport by ICAO code', function () {
      return request(app)
        .get('/airports/icao/waaa')
        .expect(200)
        .expect({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [119.55400085449219, -5.061629772186279]
          },
          properties: {
            id: '3240',
            name: 'Hasanuddin International Airport',
            city: 'Ujung Pandang',
            iata: 'UPG',
            icao: 'WAAA',
            alt: 47,
            tz: 'Asia/Makassar',
            country: 'ID',
            type: 'airport',
            source: 'OurAirports'
          }
        })
    })
    it('shall not find airport by unknown ICAO code', function () {
      return request(app)
        .get('/airports/iata/xxx')
        .expect(404)
    })
    it('shall search airport by name', function () {
      return request(app)
        .get('/airports/search/leonardo%20da')
        .expect(200)
        .expect({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [12.2388889, 41.8002778]
              },
              properties: {
                id: '1555',
                name: 'Leonardo da Vinci–Fiumicino Airport',
                city: 'Rome',
                iata: 'FCO',
                icao: 'LIRF',
                alt: 13,
                tz: 'Europe/Rome',
                country: 'IT',
                type: 'airport',
                source: 'OurAirports'
              }
            }
          ]
        })
    })
    it('shall get airports by bounding box', function () {
      return request(app)
        .get('/airports/bbox/49,8/48,7')
        .expect(200)
        .expect('X-Cache', 'MISS')
        .then(res => {
          const { features } = res.body
          const r = features.map(f => {
            const { coordinates } = f.geometry
            const { name, country } = f.properties
            return [country, coordinates, name]
          })
          // console.log(r.map(r => JSON.stringify(r)).join(',\n'))
          assert.deepStrictEqual(r, [
            [
              'DE',
              [7.83249998093, 48.022777557400005],
              'Freiburg i. Br. Airport'
            ],
            [
              'FR',
              [7.359010219573975, 48.109901428222656],
              'Colmar-Houssen Airport'
            ],
            ['FR', [7.205, 48.7680556], 'Phalsbourg-Bourscheid Air Base'],
            ['FR', [7.81760978699, 48.7943000793], 'Haguenau Airport'],
            [
              'FR',
              [7.628230094909668, 48.538299560546875],
              'Strasbourg Airport'
            ],
            [
              'FR',
              [7.77806, 48.554401],
              'Strasbourg Neuhof Airfield'
            ],
            ['DE', [7.82772016525, 48.3693008423], 'Lahr Airport'],
            ['FR', [7.734547, 48.585068], 'Gare de Strasbourg'],
            ['FR', [7.734444, 48.585], 'Strasbourg Bus Station']
          ])
        })
    })
    it('shall get airports by bounding box from cache', function () {
      return request(app)
        .get('/airports/bbox/49,8/48,7')
        .expect(200)
        .expect('X-Cache', 'HIT')
    })
    it('shall get airports by bounding box filtered by country code', function () {
      return request(app)
        .get('/airports/bbox/49,8/48,7?country=DE')
        .expect(200)
        .expect({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [7.83249998093, 48.022777557400005]
              },
              properties: {
                id: '395',
                name: 'Freiburg i. Br. Airport',
                city: 'Freiburg',
                icao: 'EDTF',
                alt: 801,
                tz: 'Europe/Berlin',
                country: 'DE',
                type: 'airport',
                source: 'OurAirports'
              }
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [7.82772016525, 48.3693008423]
              },
              properties: {
                id: '7905',
                name: 'Lahr Airport',
                city: 'Lahr',
                iata: 'LHA',
                icao: 'EDTL',
                alt: 511,
                tz: 'Europe/Berlin',
                country: 'DE',
                type: 'airport',
                source: 'OurAirports'
              }
            }
          ]
        })
    })
    it('shall get airports by bounding box filtered by type', function () {
      return request(app)
        .get('/airports/bbox/48.7,6.5/47,10?type=bus&country=FR,CH')
        .expect(200)
        // .then(res => console.log('%j', res.body))
        .expect({ 'type': 'FeatureCollection', 'features': [{ 'type': 'Feature', 'geometry': { 'type': 'Point', 'coordinates': [7.734444, 48.585] }, 'properties': { 'id': '9816', 'name': 'Strasbourg Bus Station', 'city': 'Strasbourg', 'country': 'FR', 'iata': 'XER', 'alt': 433, 'tz': 'Europe/Paris', 'type': 'bus', 'source': 'User' } }] })
    })
  })

  describe('airlines', function () {
    it('shall get airline by IATA code', function () {
      return request(app)
        .get('/airlines/iata/4u')
        .expect(200)
        .expect({
          id: '2548',
          name: 'Germanwings',
          iata: '4U',
          icao: 'GWI',
          callsign: 'GERMAN WINGS',
          active: true,
          country: 'DE'
        })
      // .then(x => console.log('%j', x.body))
    })
    it('shall get airline by ICAO code', function () {
      return request(app)
        .get('/airlines/icao/sas')
        .expect(200)
        .expect({
          id: '4319',
          name: 'Scandinavian Airlines System',
          alias: 'SAS Scandinavian Airlines',
          iata: 'SK',
          icao: 'SAS',
          callsign: 'SCANDINAVIAN',
          active: true,
          country: 'SE'
        })
      // .then(x => console.log('%j', x.body))
    })
    it('shall get airlines by callsign', function () {
      return request(app)
        .get('/airlines/callsign/aloha')
        .expect(200)
        .expect({
          id: '22',
          name: 'Aloha Airlines',
          iata: 'AQ',
          icao: 'AAH',
          callsign: 'ALOHA',
          active: true,
          country: 'US'
        })
      // .then(x => console.log('%j', x.body))
    })
    it('shall search airlines by name', function () {
      return request(app)
        .get('/airlines/search/albatros')
        .expect(200)
        .then(({ body }) => {
          assert.deepStrictEqual(body.map(a => a.name), [
            'Aero Albatros',
            'Aero Albatros',
            'Aerotaxis Albatros',
            'Albatros Airways'
          ])
        })
    })
  })
})
