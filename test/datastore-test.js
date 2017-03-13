/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const parallel = require('async/parallel')
const waterfall = require('async/waterfall')
const each = require('async/each')
const _ = require('lodash')
const Key = require('interface-datastore').Key

module.exports = (repo) => {
  describe('datastore', () => {
    const dataList = _.range(100).map((i) => new Buffer(`hello-${i}-${Math.random()}`))
    const data = new Buffer('hello world')
    const b = new Key('hello')

    describe('.put', () => {
      it('simple', (done) => {
        repo.store.put(b, data, done)
      })

      it('multi write (locks)', (done) => {
        parallel([
          (cb) => repo.store.put(b, data, cb),
          (cb) => repo.store.put(b, data, cb)
        ], done)
      })

      it('massive multiwrite', (done) => {
        each(_.range(100), (i, cb) => {
          repo.store.put(new Key('hello' + i), dataList[i], cb)
        }, done)
      })
    })

    describe('.get', () => {
      it('simple', (done) => {
        repo.store.get(b, (err, val) => {
          expect(err).to.not.exist()
          expect(val).to.be.eql(data)
          done()
        })
      })

      it('massive read', (done) => {
        parallel(_.range(20 * 100).map((i) => (cb) => {
          const j = i % dataList.length
          repo.store.get(new Key('hello' + j), (err, val) => {
            expect(err).to.not.exist()
            expect(val).to.be.eql(dataList[j])
            cb()
          })
        }), done)
      })
    })

    describe('.has', () => {
      it('existing entry', (done) => {
        repo.store.has(b, (err, exists) => {
          expect(err).to.not.exist()
          expect(exists).to.eql(true)
          done()
        })
      })

      it('non existent block', (done) => {
        repo.store.has(new Key('world'), (err, exists) => {
          expect(err).to.not.exist()
          expect(exists).to.eql(false)
          done()
        })
      })
    })

    describe('.delete', () => {
      it('simple', (done) => {
        waterfall([
          (cb) => repo.store.delete(b, cb),
          (cb) => repo.store.has(b, cb)
        ], (err, exists) => {
          expect(err).to.not.exist()
          expect(exists).to.equal(false)
          done()
        })
      })
    })
  })
}
