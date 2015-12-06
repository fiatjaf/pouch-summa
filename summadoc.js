function SummaDoc(doc) {
  var self = this
  var source = {}

  Object.defineProperty(self, 'SummaDoc', {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  })

  function define (key) {
    Object.defineProperty(self, key, {
      enumerable: true,
      configurable: true,
      get: (function (k) {
        return function () {
          if (
               k[0] != '_' &&
               typeof source[k] == 'object' &&
               source[k]._val != undefined &&
               Object.keys(source[k]).length == 1
             ) {
            return source[k]._val
          }
          return source[k]
        }
      })(key),
      set: (function (k) {
        return function (n) { set(k, n) }
      })(key)
    })
  }

  function set (k, n) {
    if (typeof source[k] == 'object' && typeof n != 'object') {
      source[k]._val = n
      return
    } else if (typeof n == 'object') {
      source[k] = wrap(n)
      return
    }
    source[k] = n
  }
  
  for (var key in doc) {
    source[key] = doc[key]
    define(key)
  }

  Object.defineProperty(self, 'onSetNew', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function (key, newValue, old, dontReset) {
      if (key[0] == '_') {
        source[key] = newValue
        return
      }

      if (old == undefined) {
        set(key, newValue)
        define(key)
      } else {
        if (typeof old == 'object' && typeof self[key] != 'object') {
          set(key, old)
          define(key)
        } else {
          self[key] = old
        }

        self.onSetNew(key, newValue, undefined, true)
      }
    }
  })

  Object.defineProperty(self, 'onDelete', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function (k) {
      delete source[k]
    }
  })

  Object.defineProperty(self, 'getRaw', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function () {
      var raw = {}
      for (var k in self) {
        if (source[k] == undefined) {
          self.onSetNew(k, self[k])
        }

        var v = source[k]
        if (v.SummaDoc) {
          raw[k] = v.getRaw()
        } else {
          raw[k] = v
        }
      }
      return raw
    }
  })

}

function wrap (obj) {
  var wrapped = {}
  for (var k in obj) {
    var v = obj[k]
    if (k[0] == "_" || v._val != undefined && Object.keys(v).length == 1) {
      wrapped[k] = v
      continue
    } else if (typeof v != 'object') {
      wrapped[k] = {_val: v}
      continue
    }
    wrapped[k] = wrap(v)
  }

  var summadoc = new SummaDoc(wrapped)

  if (typeof Proxy != 'undefined') {
    return new Proxy(summadoc, {
      set: function (target, property, value) {
        var isNew = !(property in target)
        target[property] = value
        target.onSetNew(property, value)
      },
      deleteProperty: function (target, property) {
        var actuallyDeleted = (property in target)
        delete target[property]
        target.onDelete(property)
      }
    })
  } else {
    if ('observe' in Object) {
      Object.observe(summadoc, function (changes) {
        for (var i = 0; i < changes.length; i++) {
          var change = changes[i]
          var target = change.object
          if (change.type == 'add') {
            target.onSetNew(change.name, target[change.name])
          } else if (change.type == 'update') {
            target.onSetNew(change.name, target[change.name], change.oldValue)
          } else if (change.type == 'delete') {
            target.onDelete(change.name)
          }
        }
      })
    }

    return summadoc
  }
}

function unwrap (o) {
  if (o == undefined) {
    return undefined
  } else if (o.SummaDoc) {
    return o.getRaw()
  } else {
    return wrap(o).getRaw()
  }
}

SummaDoc.wrap = wrap
SummaDoc.unwrap = unwrap

if (typeof exports != 'undefined') {
  exports.wrap = wrap
  exports.unwrap = unwrap
}
