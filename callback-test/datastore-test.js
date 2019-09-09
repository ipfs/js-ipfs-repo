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
    const dataList = _.range(100).map((i) => Buffer.from(`hello-${i}-${Math.random()}`))
    const data = Buffer.from('hello world')
    const b = new Key('hello')

    describe('.put', () => {
      it('simple', (done) => {
        repo.datastore.put(b, data, done)
      })

      it('multi write (locks)', (done) => {
        parallel([
          (cb) => repo.datastore.put(b, data, cb),
          (cb) => repo.datastore.put(b, data, cb)
        ], done)
      })

      it('massive multiwrite', function (done) {
        this.timeout(15000) // add time for ci
        each(_.range(100), (i, cb) => {
          repo.datastore.put(new Key('hello' + i), dataList[i], cb)
        }, done)
      })
    })

    describe('.get', () => {
      it('simple', (done) => {
        repo.datastore.get(b, (err, val) => {
          expect(err).to.not.exist()
          expect(val).to.be.eql(data)
          done()
        })
      })

      it('massive read', function (done) {
        this.timeout(15000) // add time for ci
        parallel(_.range(20 * 100).map((i) => (cb) => {
          const j = i % dataList.length
          repo.datastore.get(new Key('hello' + j), (err, val) => {
            expect(err).to.not.exist()
            expect(val).to.be.eql(dataList[j])
            cb()
          })
        }), done)
      }).timeout(10 * 1000)
    })

    describe('.has', () => {
      it('existing entry', (done) => {
        repo.datastore.has(b, (err, exists) => {
          expect(err).to.not.exist()
          expect(exists).to.eql(true)
          done()
        })
      })

      it('non existent block', (done) => {
        repo.datastore.has(new Key('world'), (err, exists) => {
          expect(err).to.not.exist()
          expect(exists).to.eql(false)
          done()
        })
      })
    })

    describe('.delete', () => {
      it('simple', (done) => {
        waterfall([
          (cb) => repo.datastore.delete(b, cb),
          (cb) => repo.datastore.has(b, cb)
        ], (err, exists) => {
          expect(err).to.not.exist()
          expect(exists).to.equal(false)
          done()
        })
      })
    })
  })
}
