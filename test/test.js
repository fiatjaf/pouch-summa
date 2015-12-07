'use strict'

if (typeof window == 'undefined') {
  var PouchDB = require('pouchdb')
  PouchDB.plugin(require('transform-pouch'))

  var pouchSumma = require('../')
  
  var chai = require('chai')
}
var expect = chai.expect

describe('standalone', function () {
  var normal = [
    {_id: 'ananan', value: 23, people: { mark: true, anna: true }},
    {_rev: 'goiaba', _val: 1, items: {a: {ok: true}, b: {ok: false}}},
    {a: 'asd', b: {_val: 'asd', _rev: '123'}}
  ]
  var transf = [
    {_id: 'ananan', value: {_val: 23}, people: { mark: {_val: true}, anna: {_val: true} }},
    {_rev: 'goiaba', _val: 1, items: {a: {ok: {_val: true}}, b: {ok: {_val: false}}}},
    {a: {_val: 'asd'}, b: {_val: 'asd', _rev: '123'}}
  ]

  it('should transform docs to summadb format', function () {
    for (var i = 0; i < normal.length; i++) {
      expect(pouchSumma.incoming(normal[i])).to.deep.equal(transf[i])
    }
  })

  it('should should bring docs back', function () {
    for (var i = 0; i < normal.length; i++) {
      expect(pouchSumma.incoming(transf[i])).to.deep.equal(normal[i])
    }
  })
})

describe('with db', function () {
  var db
  var rawdb

  before(function () {
    db = new PouchDB('db-test')
    db.transform(pouchSumma)
    rawdb = new PouchDB('db-test')
  })

  after(function () {
    return db.destroy()
  })

  it('should save and retrieve correctly', function () {
    var init = {
      _id: 'mana',
      fruita: 'tomate',
      queijo: {
        canastra: true,
        reino: {
          bonito: true,
          barato: false,
          _val: true
        }
      },
    }
    return db.put(init)
    .then(() => db.get('mana'))
    .then(doc => {
      delete doc._rev
      return doc
    })
    .then(doc => expect(doc).to.deep.equal(init))
  })

  it('should modify, save again, and it should be good', function () {
    return db.get('mana')
    .then(doc => {
      doc.fruita = 'laranja'
      return db.put(doc)
    }).then(() => db.get('mana'))
    .then(doc => {
      delete doc._rev
      return doc
    })
    .then(doc => expect(doc).to.deep.equal({
      _id: 'mana',
      fruita: 'laranja',
      queijo: {
        canastra: true,
        reino: {
          bonito: true,
          barato: false,
          _val: true
        }
      },
    }))
  })

  it('should modify more badly, save again, and it should be good', function () {
    return db.get('mana')
    .then(doc => {
      doc['país'] = 'RS'
      doc.cidade = 'porto alegre'
      doc.cidade = {
        _val: 'porto alegre',
        musica: 'deu pra ti'
      }
      doc['país'] = 'SC'
      doc.cidade.roger = 'cuidem da comunidade'
      doc.cidade._val = 'garopaba'
      delete doc.queijo
      delete doc.fruita
      doc.thick = {as: {a: 'brick'}}
      expect(pouchSumma.incoming(doc)).to.deep.equal({
        _id: 'mana',
        _rev: doc._rev,
        cidade: {
          _val: 'garopaba',
          musica: {_val: 'deu pra ti'},
          roger: {_val: 'cuidem da comunidade'}
        },
        'país': {_val: 'SC'},
        thick: {
          as: {
            a: {
              _val: 'brick'
            }
          }
        }
      })
      return db.put(doc)
    }).then(() => db.get('mana'))
    .then(doc => expect(doc).to.deep.equal({
      _id: 'mana',
      _rev: doc._rev,
      cidade: {
        _val: 'garopaba',
        musica: 'deu pra ti',
        roger: 'cuidem da comunidade'
      },
      'país': 'SC',
      thick: {
        as: {
          a: 'brick'
        }
      }
    }))
  })

  it('should get the summa format if fetching from a non-transformer database', function () {
    rawdb.allDocs({include_docs: true}).then(rs => rs.map(r => r.doc))
    .then(docs => expect(docs[0]).to.deep.equal({
      _id: 'mana',
      _rev: doc._rev,
      cidade: {
        _val: 'garopaba',
        musica: {_val: 'deu pra ti'},
        roger: {_val: 'cuidem da comunidade'}
      },
      'país': {_val: 'SC'},
      thick: {
        as: {
          a: {
            _val: 'brick'
          }
        }
      }
    }))
  })

  it('should save in the raw db, fetch transformed from the other', function () {
    var id
    var rev

    db.post({
      mannanan: {
        tagline: {_val: 'o barco da alegria'},
        type: {_val: 'boat'}
      },
      location: {_val: 'isle of mann'},
      wrong: 'this name should not be here'
    }).then(r => {
      id = r.id
      rev = r.rev
      return db.allDocs({keys: [r.id], include_docs: true})
    })
    .then((rs => rs.map(r => r.doc)))
    .then(doc => expect(docs[0]).to.deep.equal({
      _id: id,
      _rev: rev,
      mannanan: {
        tagline: 'o barco da alegria',  
        type: 'boat'
      },
      location: 'isle of mann',
      wrong: 'this name should not be here'
    }))
  })
  
})
