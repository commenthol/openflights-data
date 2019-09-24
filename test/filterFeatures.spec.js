const assert = require('assert')
const filter = require('../src/filterFeatures')

describe('filterFeatures', function () {
  const features = [
    { iata: 'iata1', country: 'c1' },
    { icoa: 'icoa1', country: 'c1' },
    { iata: 'iata2', country: 'c2' },
    { icoa: 'icoa2', country: 'c1', type: 't1' },
    { iata: 'iata3', country: 'c2', type: 't2' },
    { icoa: 'icoa3', country: 'c2', type: 't3' },
    { country: 'c1' },
    { country: 'c3' },
    { country: 'c2', type: 't1' }
  ]

  const withProps = (features) => features.map(f => ({ properties: f }))
  const f = withProps(features)

  it('should get all features', function () {
    const res = filter()(f)
    assert.deepStrictEqual(res, f)
  })
  it('should get all features with iata', function () {
    const res = filter({ iata: '1' })(f)
    assert.deepStrictEqual(res, withProps([
      { iata: 'iata1', country: 'c1' },
      { iata: 'iata2', country: 'c2' },
      { iata: 'iata3', country: 'c2', type: 't2' }
    ]))
  })
  it('should get all features with country c1', function () {
    const res = filter({ country: 'c1' })(f)
    // console.log(res)
    assert.deepStrictEqual(res, [
      { properties: { iata: 'iata1', country: 'c1' } },
      { properties: { icoa: 'icoa1', country: 'c1' } },
      { properties: { icoa: 'icoa2', country: 'c1', type: 't1' } },
      { properties: { country: 'c1' } }])
  })
  it('should get all features with countries c1,c3', function () {
    const res = filter({ country: 'c1,c3' })(f)
    // console.log(res)
    assert.deepStrictEqual(res, [
      { properties: { iata: 'iata1', country: 'c1' } },
      { properties: { icoa: 'icoa1', country: 'c1' } },
      { properties: { icoa: 'icoa2', country: 'c1', type: 't1' } },
      { properties: { country: 'c1' } },
      { properties: { country: 'c3' } }
    ])
  })
  it('should get all features and iata countries c1,c3', function () {
    const res = filter({ country: 'c1,c3', iata: '1' })(f)
    // console.log(res)
    assert.deepStrictEqual(res, [
      { properties: { iata: 'iata1', country: 'c1' } }
    ])
  })
  it('should get all features with no iata countries c1,c3', function () {
    const res = filter({ country: 'c1,c3', iata: 'false' })(f)
    // console.log(res); return
    assert.deepStrictEqual(res, [
      { properties: { icoa: 'icoa1', country: 'c1' } },
      { properties: { icoa: 'icoa2', country: 'c1', type: 't1' } },
      { properties: { country: 'c1' } },
      { properties: { country: 'c3' } }
    ])
  })
  it('should get all features with no iata and countries c1,c3 and type t1', function () {
    const res = filter({ country: 'c1,c3', iata: 'false', type: 't1' })(f)
    // console.log(res)
    assert.deepStrictEqual(res, [
      { properties: { icoa: 'icoa2', country: 'c1', type: 't1' } }
    ])
  })
})
