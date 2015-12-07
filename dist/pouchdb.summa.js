(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pouchSumma = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  if (Object.keys(obj).length == 1 && '_val' in obj) {
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

},{}]},{},[1])(1)
});