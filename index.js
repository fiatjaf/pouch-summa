'use strict';

var wrappers = require('pouchdb-wrappers')
var SummaDoc = require('./summadoc')

exports = typeof exports == 'undefined' ? {} : exports
exports.summa = function () {
  var db = this

  wrappers.installWrapperMethods(db, handlers)
}

var handlers = {}

handlers.put = function (exec, args) {
  args.doc = SummaDoc.unwrap(args.doc)
  return exec()
}

handlers.post = function (exec, args) {
  args.doc = SummaDoc.unwrap(args.doc)
  return exec()
}

handlers.bulkDocs = function (exec, args) {
  for (var i = 0; i < args.docs.length; i++) {
    args.docs[i] = SummaDoc.unwrap(args.docs[i]);
  }
  return exec()
}

handlers.allDocs = function (exec) {
  return exec().then(function (res) {
    res.rows.forEach(function () {
      if (row.doc) {
        row.doc = SummaDoc.wrap(row.doc)
      }
    })
  })
}

handlers.get = function (exec) {
  return exec().then(function (res) {
    if (Array.isArray(res)) {
      // open_revs style, it's a list of docs
      res.forEach(function (doc) {
        if (doc.ok) {
          doc.ok = SummaDoc.wrap(doc.ok)
        }
      })
    } else {
      res = SummaDoc.wrap(res)
    }
    return res
  })
}

handlers.query = function (exec) {
  return exec().then(function (res) {
    res.rows.forEach(function (row) {
      if (row.doc) {
        row.doc = SummaDoc.wrap(row.doc)
      }
    })
    return res
  })
}

handlers.changes = function (exec) {
    function modifyChange(change) {
      if (change.doc) {
        change.doc = SummaDoc.wrap(change.doc)
      }
      return change
    }

    function modifyChanges(res) {
      res.results = res.results.map(modifyChange)
      return res
    }

    var changes = exec()
    // override some events
    var origOn = changes.on
    changes.on = function (event, listener) {
      if (event === 'change') {
        return origOn.apply(changes, [event, function (change) {
          listener(modifyChange(change))
        }])
      } else if (event === 'complete') {
        return origOn.apply(changes, [event, function (res) {
          listener(modifyChanges(res))
        }])
      }
      return origOn.apply(changes, [event, listener])
    }

    var origThen = changes.then
    changes.then = function (resolve, reject) {
      return origThen.apply(changes, [function (res) {
        resolve(modifyChanges(res))
      }, reject])
    }
    return changes
}


if (typeof window !== 'undefined' && window.PouchDB) {
  window.PouchDB.plugin(exports);
}
