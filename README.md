[![Travis CI status](https://travis-ci.org/fiatjaf/pouch-summa.svg)](https://travis-ci.org/fiatjaf/pouch-summa)

Before, you would see your documents as

```json
{
  "name": {
    "_val": "Kalualualeiamba"
  },
  "items": {
    "on hand": {
      "cane": {
        "_val": 1
      }
    },
    "on pocket": {
      "red potion": {
        "_val": 7
      },
      "napkin": {
        "_val": 12
      }
    }
  }
}
```

Now you'll have them as

```json
{
  "name": "Kalualualeiamba",
  "items": {
    "on hand": {
      "cane": 1
    },
    "on pocket": {
      "red potion": 7,
      "napkin": 12
    }
  }
}
```

and you can modify properties and save the document again, without ever thinking about the `_val` again.

## Install

```
npm install --save transform-pouch
npm install --save pouch-summa
```

## Usage

```javascript
var PouchDB = require('pouchdb')
PouchDB.plugin(require('transform-pouch'))

var db = new PouchDB('this-syncs-with-summadb')
db.transform(require('pouch-summa'))
```
