var Emitter = require('events')

module.exports = function (Model) {
  var bus = new Emitter()
  var StdModel = new Proxy(Model, { apply, construct, get })
  StdModel.on = bus.on.bind(bus)
  StdModel.once = bus.once.bind(bus)
  StdModel.off = bus.off.bind(bus)

  function apply (target, self, args) {
    return new StdModel(...args)
  }

  function construct (Target, args) {
    var obj = new Target(...args)
    return new Proxy(obj, { get })
  }

  function get (target, prop) {
    if (typeof target[prop] !== 'function') {
      return target[prop]
    }
    return new Proxy(target[prop], {
      apply (fn, self, args) {
        var data = fn.apply(self, args)
        bus.emit(prop, data, target, args)
        return data
      }
    })
  }

  return StdModel
}
