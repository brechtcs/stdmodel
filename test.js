var Base = require('stdopt/base')
var model = require('./')
var test = require('tape')

/**
 * Fixtures
 */
var Model = model(function Model (prefix) {
  this.prefix = prefix
})

Model.input = function (prefix, data) {
  return prefix + ': ' + data
}

Model.prototype.input = function (data) {
  return this.prefix + ': ' + data
}

Model.prototype.empty = function () {}

Model.prototype.fail = function () {
  throw new Error('failure')
}

Model.prototype.message = function (msg) {
  return new Message(msg)
}

function Message (msg) {
  Base.call(this, msg)
}

Message.parse = function (msg) {
  return String(msg)
}

Message.prototype.shout = function () {
  return this.value().toUpperCase() + '!'
}

/**
 * Tests
 */
test('basic', function (t) {
  var obj = new Model('basic')
  var res = obj.input('yep')
  t.equal(res, 'basic: yep')
  t.throws(() => obj.fail(), /failure/)
  t.end()
})

test('static', function (t) {
  var pending = true

  function listener (result, target, args) {
    t.ok(pending)
    t.equal(result.value(), 'static: ping')
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
      t.equal(result.value(), 'first: dit')
      t.equal(args.length, 2)
      t.equal(args[0], 'dit')
      t.equal(args[1], 'nope')
    } else if (target.prefix === 'second') {
      t.equal(result.value(), 'second: dat')
      t.equal(args.length, 1)
      t.equal(args[0], 'dat')
    } else {
      t.fail('illegal state')
    }
  })

  Model.on('message', function (result) {
    t.equal(result.shout(), 'HELLO!')
  })

  first.input('dit', 'nope')
  second.input('dat')
  second.message('hello')
  t.end()
})

test('result', function (t) {
  var obj = new Model('result')

  Model.on('empty', function (result) {
    t.ok(result.isValid)
    t.equal(result.extract(), null)
  })

  Model.on('fail', function (result) {
    t.ok(result.isError)
    t.ok(result.extract() instanceof Error)
    t.throws(() => result.value(), /failure/)
  })

  try {
    obj.empty()
    obj.fail()
  } catch (e) {} finally {
    t.end()
  }
})
