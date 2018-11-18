export default class Delayed {
  trigger (fn, timeout = 300) {
    const { timer } = this
    if (!timer) fn()
    clearTimeout(timer)
    this.timer = setTimeout(() => {
      fn()
      this.timer = undefined
    }, timeout)
  }
}
