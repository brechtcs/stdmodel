var model = require('./')
var test = require('tape')

var Model = model(function Model (prefix) {
  this.prefix = prefix
})

Model.input = function (prefix, data) {
  return prefix + ': ' + data
}

Model.prototype.input = function (data) {
  return this.prefix + ': ' + data
}

test('static', function (t) {
  var pending = true

  function listener (result, target, args) {
    t.ok(pending)
    t.equal(result, 'static: ping')
    t.equal(target.prototype, Model.prototype)
    t.equal(args.length, 2)
    t.equal(args[0], 'static')
    t.equal(args[1], 'ping')
    pending = false
  }

  Model.on('input', listener)
  Model.input('static', 'ping')
  Model.off('input', listener)
  Model.input('static', 'pong')
  t.end()
})

test('instances', function (t) {
  var first = new Model('first')
  var second = Model('second')

  Model.on('input', function (result, target, args) {
    t.ok(target instanceof Model)

    if (target.prefix === 'first') {
      t.equal(result, 'first: dit')
      t.equal(args.length, 2)
      t.equal(args[0], 'dit')
      t.equal(args[1], 'nope')
    } else if (target.prefix === 'second') {
      t.equal(result, 'second: dat')
      t.equal(args.length, 1)
      t.equal(args[0], 'dat')
    } else {
      t.fail('illegal state')
    }
  })

  first.input('dit', 'nope')
  second.input('dat')
  t.end()
})
