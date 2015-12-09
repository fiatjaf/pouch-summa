function incoming (doc) {
  // before storage
  return putValsDown(doc)
}

function putValsDown (obj) {
  for (var k in obj) {
    if (k[0] == '_') {
      // do nothing
    } else if (typeof obj[k] == 'object') {
      obj[k] = putValsDown(obj[k])
    } else {
      obj[k] = {_val: obj[k]}
    }
  }
  return obj
}

function  outgoing (doc) {
  // after retrieval
  return bringUpVal(doc)
}

function bringUpVal (obj) {
  if (Object.keys(obj).length == 1 && obj._val != undefined) {
    return obj._val
  }
  for (var k in obj) {
    if (k[0] == '_') continue
    obj[k] = bringUpVal(obj[k])
  }
  return obj
}

module.exports = {
  incoming: incoming,
  outgoing: outgoing
}
