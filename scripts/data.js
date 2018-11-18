/* eslint no-console: 0 */

const fs = require('fs')
const https = require('https')
const { URL } = require('url')

const config = {
  'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports-extended.dat':
  `${__dirname}/../data/airports-extended.dat`,
  // 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat':
  //   `${__dirname}/../data/airports.dat`,
  'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat':
    `${__dirname}/../data/airlines.dat`
}

const download = (url, filename) => {
  fs.stat(filename, err => {
    if (!err) return
    console.log('downloading %s from %s', filename, url)

    const opts = new URL(url)
    opts.method = 'GET'

    https.request(opts, res => {
      res.pipe(fs.createWriteStream(filename))
    }).end()
  })
}

Object.keys(config).forEach(url => {
  const filename = config[url]
  download(url, filename)
})
