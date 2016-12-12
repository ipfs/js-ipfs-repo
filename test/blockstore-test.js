/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const Block = require('ipfs-block')
const mh = require('multihashes')
const pull = require('pull-stream')
const parallel = require('async/parallel')
const waterfall = require('async/waterfall')
const _ = require('lodash')

module.exports = (repo) => {
  describe('blockstore', () => {
    const helloKey = 'CIQLS/CIQLSTJHXGJU2PQIUUXFFV62PWV7VREE57RXUU4A52IIR55M4LX432I.data'
    const blockCollection = _.range(100).map((i) => new Block(new Buffer(`hello-${i}-${Math.random()}`)))
    const b = new Block(new Buffer('hello world'))
    let bKey

    before((done) => {
      b.key((err, key) => {
        if (err) {
          return done(err)
        }
        bKey = key
        done()
      })
    })

    describe('.putStream', () => {
      it('simple', (done) => {
        pull(
          pull.values([
            { data: b.data, key: bKey }
          ]),
          repo.blockstore.putStream(),
          pull.collect((err, meta) => {
            expect(err).to.not.exist
            expect(meta[0].key).to.be.eql(helloKey)
            done()
          })
        )
      })

      it('multi write (locks)', (done) => {
        let i = 0
        const finish = (err, meta) => {
          expect(err).to.not.exist
          expect(meta[0].key).to.equal(helloKey)

          i++
          if (i === 2) done()
        }

        pull(
          pull.values([
            { data: b.data, key: bKey }
          ]),
          repo.blockstore.putStream(),
          pull.collect(finish)
        )

        pull(
          pull.values([
            { data: b.data, key: bKey }
          ]),
          repo.blockstore.putStream(),
          pull.collect(finish)
        )
      })

      it('massive multiwrite', (done) => {
        parallel(_.range(50).map(() => (cb) => {
          pull(
            pull.values(blockCollection),
            pull.asyncMap((b, cb) => {
              b.key((err, key) => {
                if (err) {
                  return cb(err)
                }
                cb(null, {data: b.data, key: key})
              })
            }),
            repo.blockstore.putStream(),
            pull.collect((err, meta) => {
              expect(err).to.not.exist
              expect(meta).to.have.length(100)
              cb()
            })
          )
        }), done)
      })

      it('returns an error on invalid block', (done) => {
        pull(
          pull.values(['hello']),
          repo.blockstore.putStream(),
          pull.onEnd((err) => {
            expect(err.message).to.be.eql('Invalid block')
            done()
          })
        )
      })
    })

    describe('.getStream', () => {
      it('simple', (done) => {
        pull(
          repo.blockstore.getStream(bKey),
          pull.collect((err, data) => {
            expect(err).to.not.exist
            data[0].key((err, key) => {
              expect(err).to.not.exist
              expect(key).to.be.eql(bKey)
              done()
            })
          })
        )
      })

      it('massive read', (done) => {
        parallel(_.range(20 * 100).map((i) => (cb) => {
          const j = i % blockCollection.length
          pull(
            pull.values([blockCollection[j]]),
            pull.asyncMap((b, cb) => b.key(cb)),
            pull.map((key) => repo.blockstore.getStream(key)),
            pull.flatten(),
            pull.collect((err, meta) => {
              expect(err).to.not.exist
              parallel([
                (cb) => meta[0].key(cb),
                (cb) => blockCollection[j].key(cb)
              ], (err, res) => {
                expect(err).to.not.exist
                expect(res[0]).to.be.eql(res[1])
                cb()
              })
            })
          )
        }), done)
      })

      it('returns an error on invalid block', (done) => {
        pull(
          repo.blockstore.getStream(),
          pull.onEnd((err) => {
            expect(err.message).to.be.eql('Invalid key')
            done()
          })
        )
      })
    })

    describe('.has', () => {
      it('existing block', (done) => {
        const b = new Block('hello world')
        waterfall([
          (cb) => b.key(cb),
          (key, cb) => repo.blockstore.has(key, cb)
        ], (err, exists) => {
          expect(err).to.not.exist
          expect(exists).to.equal(true)
          done()
        })
      })

      it('non existent block', (done) => {
        const b = new Block('wooot')

        waterfall([
          (cb) => b.key(cb),
          (key, cb) => repo.blockstore.has(key, cb)
        ], (err, exists) => {
          expect(err).to.not.exist
          expect(exists).to.equal(false)
          done()
        })
      })
    })

    describe('.delete', () => {
      it('simple', (done) => {
        const b = new Block('hello world')
        b.key((err, key) => {
          expect(err).to.not.exist

          waterfall([
            (cb) => repo.blockstore.delete(key, cb),
            (cb) => repo.blockstore.has(key, cb)
          ], (err, exists) => {
            expect(err).to.not.exist
            expect(exists).to.equal(false)
            done()
          })
        })
      })
    })

    describe('interop', () => {
      it('reads welcome-to-ipfs', (done) => {
        const welcomeHash = mh.fromHexString(
          '1220120f6af601d46e10b2d2e11ed71c55d25f3042c22501e41d1246e7a1e9d3d8ec'
        )
        pull(
          repo.blockstore.getStream(welcomeHash),
          pull.collect((err, blocks) => {
            expect(err).to.not.exist
            expect(
              blocks[0].data.toString()
            ).to.match(
                /Hello and Welcome to IPFS/
            )
            done()
          })
        )
      })
    })
  })
}
