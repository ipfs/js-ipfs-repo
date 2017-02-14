/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const Block = require('ipfs-block')
const mh = require('multihashes')
const pull = require('pull-stream')
const parallel = require('async/parallel')
const series = require('async/series')
const waterfall = require('async/waterfall')
const _ = require('lodash')

module.exports = (testConfig) => {
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
          testConfig.repo.blockstore.putStream(),
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
          testConfig.repo.blockstore.putStream(),
          pull.collect(finish)
        )

        pull(
          pull.values([
            { data: b.data, key: bKey }
          ]),
          testConfig.repo.blockstore.putStream(),
          pull.collect(finish)
        )
      })

      it('returns an error on invalid block', (done) => {
        pull(
          pull.values(['hello']),
          testConfig.repo.blockstore.putStream(),
          pull.onEnd((err) => {
            expect(err.message).to.be.eql('Invalid block')
            done()
          })
        )
      })
    })

    describe('.getStream', () => {
      it('simple', (done) => {
        series([
          // seed blockstore
          (cb) => {
            pull(
              pull.values([
                { data: b.data, key: bKey }
              ]),
              testConfig.repo.blockstore.putStream(),
              pull.collect(cb)
            )
          },
          // read from blockstore
          (cb) => {
            pull(
              testConfig.repo.blockstore.getStream(bKey),
              pull.collect((err, data) => {
                expect(err).to.not.exist
                data[0].key((err, key) => {
                  expect(err).to.not.exist
                  expect(key).to.be.eql(bKey)
                  cb()
                })
              })
            )
          }
        ], done)
      })

      it('returns an error on invalid block', (done) => {
        pull(
          testConfig.repo.blockstore.getStream(),
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
          // put "hello world" block
          (cb) => {
            pull(
              pull.values([
                { data: b.data, key: bKey }
              ]),
              testConfig.repo.blockstore.putStream(),
              pull.collect(cb)
            )
          },
          // check existence of "hello world" block
          (meta, cb) => testConfig.repo.blockstore.has(bKey, cb)
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
          (key, cb) => testConfig.repo.blockstore.has(key, cb)
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
            (cb) => testConfig.repo.blockstore.delete(key, cb),
            (cb) => testConfig.repo.blockstore.has(key, cb)
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
          testConfig.repo.blockstore.getStream(welcomeHash),
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

    describe('integration', () => {
      it('massive write and read', (done) => {
        series([
          // massive write
          (next) => {
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
                testConfig.repo.blockstore.putStream(),
                pull.collect((err, meta) => {
                  expect(err).to.not.exist
                  expect(meta).to.have.length(100)
                  cb()
                })
              )
            }), next)
          },
          // massive read
          (next) => {
            parallel(_.range(20 * 100).map((i) => (cb) => {
              const j = i % blockCollection.length
              pull(
                pull.values([blockCollection[j]]),
                pull.asyncMap((b, cb) => b.key(cb)),
                pull.map((key) => testConfig.repo.blockstore.getStream(key)),
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
            }), next)
          }
        ], done)
      })
    })
  })
}
