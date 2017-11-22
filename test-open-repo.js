const path = require('path')
const IPFSRepo = require('./src')
const opts = {
    name: 'default existing',
    opts: undefined,
    init: false
}
const repoPath = path.resolve(__dirname, 'test','test-repo')
const repo = new IPFSRepo(repoPath, opts)

repo.open((err) => {
    console.log(err)
    repo.close((err) => {
        console.log(err)
    })
})
