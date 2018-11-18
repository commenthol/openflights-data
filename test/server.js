/* eslint no-console:0 */
const express = require('express')
const app = express()
const compress = require('compression')
const { router } = require('..')
const port = 3003

if (require.main === module) {
  app.use(compress())
  app.use((req, res, next) => {
    const { method, url } = req
    console.log(method, url)
    res.setHeader('Access-Control-Allow-Origin', '*')
    next()
  })
  app.use('/api', router())
  app.use('/', express.static(`${__dirname}/../example/build`))
  app.listen(port, () => console.log('running on port:' + port))
}
