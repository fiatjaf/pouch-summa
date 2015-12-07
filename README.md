[![Travis CI status](https://travis-ci.org/fiatjaf/pouch-summa.svg)](https://travis-ci.org/fiatjaf/pouch-summa)

## Install

```
npm install --save transform-pouch
npm install --save pouch-summa
```

## Usage

```
var PouchDB = require('pouchdb')
PouchDB.plugin(require('transform-pouch'))

var db = new PouchDB('this-syncs-with-summadb')
db.transform(require('pouch-summa'))
```
