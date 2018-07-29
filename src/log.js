const debug = require('debug')
const log = (name = '') => debug('openflight-data' + name)
module.exports = log
