const { STATUS_CODES } = require('http')

/**
 * HTTP Error
 * @param {Number} status - http status code
 * @param {String|Error} msg - message or error
 * @param {String} [code] - optional code
 * @return {Error} error
 */
const httpError = (status = 500, msg, code) => {
  msg = msg || STATUS_CODES[status]
  const err = msg instanceof Error ? msg : new Error(msg)
  err.status = status
  if (code) err.code = code
  return err
}

module.exports = httpError
