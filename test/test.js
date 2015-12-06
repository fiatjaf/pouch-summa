'use strict'

if (typeof window == 'undefined') {
  var PouchDB = require('pouchdb')
  
  var SummaDoc = require('../summadoc')
  var pouchSumma = require('../')
  PouchDB.plugin(pouchSumma)
  
  var chai = require('chai')
}
var expect = chai.expect

describe('standalone', function () {

  it('should transform documents', function () {
    var o = {
      _id: 'axolotl',
      _rev: '3-sdf3rai34b',
      maria: {
        name: 'maria',
        val: 23
      },
      thick: {
        as: {
          a: {
            brick: true
          },
          _val: 'tijolo'
        }
      },
      ping: {
        _val: 'pong'
      }
    }
    var sd = SummaDoc.wrap(o)
    expect(sd.SummaDoc).to.be.true
    expect(sd.ping).to.equal('pong')
    expect(sd._id).to.equal('axolotl')
    expect(sd.maria.name).to.equal('maria')
    expect(sd.thick).to.deep.equal({as: {a: {brick: true}, _val: 'tijolo'}})
    expect(sd.thick.as.a.brick).to.equal(true)
    expect(sd.thick.as._val).to.equal('tijolo')

    var nd = SummaDoc.unwrap(o)
    expect(nd).to.deep.equal({
      _id: 'axolotl',
      _rev: '3-sdf3rai34b',
      maria: {
        name: {
          _val: 'maria'
        },
        val: {
          _val: 23
        }
      },
      thick: {
        as: {
          a: {
            brick: {
              _val: true
            }
          },
          _val: 'tijolo'
        }
      },
      ping: {
        _val: 'pong'
      }
    })
  })

  it('shoud add new properties to documents (Proxy or Object.observe)', function (done) {
    var sd = SummaDoc.wrap({
      'banana': true
    })
    sd.goiaba = {maybe: true}
    sd.goiaba = 23
    setTimeout(() => {
      expect(sd.goiaba._val).to.equal(23)
      expect(sd.goiaba.maybe).to.equal(true)
      expect(SummaDoc.unwrap(sd)).to.deep.equal({
        banana: {_val: true},
        goiaba: {
          _val: 23,
          maybe: {_val: true}
        }
      })
      done()
    }, 1)
  })

})

describe('with db', function () {
  var db

  before(function () {
    db = new PouchDB('db-test')
    db.summa()
    return db
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
          barato: false
        }
      },
    }
    return db.put(init)
    .then(() => db.get('mana'))
    .then(doc => {
      expect(doc.SummaDoc).to.be.true
      delete doc._rev
      return doc
    })
    .then(doc => expect(doc).to.deep.equal(init))
  })

  it('should retrieve raw correctly', function () {
    return db.get('mana')
    .then(doc => {
      delete doc._rev
      return doc
    })
    .then(doc => expect(SummaDoc.unwrap(doc)).to.deep.equal({
      _id: 'mana',
      fruita: {_val: 'tomate'},
      queijo: {
        canastra: {_val: true},
        reino: {
          bonito: {_val: true},
          barato: {_val: false}
        }
      }
    }))
  })

  it('should modify, save again, and it should be good', function () {
    return db.get('mana')
    .then(doc => {
      doc.fruita = 'laranja'
      expect(SummaDoc.unwrap(doc)).to.deep.equal({
        _id: 'mana',
        _rev: doc._rev,
        fruita: {_val: 'laranja'},
        queijo: {
          canastra: {_val: true},
          reino: {
            bonito: {_val: true},
            barato: {_val: false}
          }
        }
      })
      return db.put(doc)
    }).then(() => db.get('mana'))
    .then(doc => {
      delete doc._rev
      return doc
    })
    .then(doc => {
      expect(SummaDoc.unwrap(doc)).to.deep.equal({
        _id: 'mana',
        fruita: {_val: 'laranja'},
        queijo: {
          canastra: {_val: true},
          reino: {
            bonito: {_val: true},
            barato: {_val: false}
          }
        }
      })
      return doc
    })
    .then(doc => expect(doc).to.deep.equal({
      _id: 'mana',
      fruita: 'laranja',
      queijo: {
        canastra: true,
        reino: {
          bonito: true,
          barato: false
        }
      },
    }))
  })

  it('should modify more badly, save again, and it should be good', function () {
    return db.get('mana')
    .then(doc => {
      expect(doc.SummaDoc).to.be.true
      doc['país'] = 'RS'
      doc.cidade = 'porto alegre'
      doc.cidade = {
        _val: 'porto alegre',
        musica: 'deu pra ti'
      }
      doc.cidade = 'garopaba'
      doc['país']._val = 'SC'
      doc.roger = 'cuidem da comunidade'
      delete doc.queijo
      delete doc.fruita
      doc.thick = {as: {a: 'brick'}}
      expect(SummaDoc.unwrap(doc)).to.deep.equal({
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
    .then(doc => {
      delete doc._rev
      return doc
    })
    .then(doc => {
      expect(SummaDoc.unwrap(doc)).to.deep.equal({
        _id: 'mana',
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
      return doc
    })
    .then(doc => expect(doc).to.deep.equal({
      _id: 'mana',
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
  
})
