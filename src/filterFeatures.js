const selectOpts = (val) => /^(1|true)$/i.test(val)
const toArray = (str = '') => str.split(',')
const xor = (a, b) => (a || !b) && (!a || b)

const filter = ({ type, country, iata, icao } = {}) => (features) => {
  if (!type && !country && !iata && !icao) {
    return features
  }
  const types = type && toArray(type)
  const countries = country && toArray(country)

  return features.filter(feature => {
    const p = feature.properties
    const a = []
    a.push(iata ? xor(selectOpts(iata), !!p.iata) : true)
    a.push(icao ? xor(selectOpts(icao), !!p.icao) : true)
    a.push(types ? types.includes(p.type) : true)
    a.push(countries ? countries.includes(p.country) : true)
    return !a.includes(false)
  })
}

module.exports = filter
