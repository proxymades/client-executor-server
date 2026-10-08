const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { buildASTSchema, validateSchema, parse, validate } = require('graphql')
const root = path.resolve(__dirname, '..')
function files(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(dir, entry.name)
        return entry.isDirectory() ? files(file) : file.endsWith('.js') ? [file] : []
    })
}
for (const file of [...files(path.join(root, 'src')), ...files(__dirname), ...files(path.join(root, 'test')), path.join(root, 'images.js')]) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
    if (result.status) throw new Error(result.stderr)
}
const { typeDefs } = require('../src/typeDefs/schema')
const schema = buildASTSchema(typeDefs)
const errors = validateSchema(schema)
const gqlDir = path.resolve(root, '../clex/src/gql')
let documents = 0
if (fs.existsSync(gqlDir)) {
    for (const file of files(gqlDir)) {
        for (const match of fs.readFileSync(file, 'utf8').matchAll(/gql`([\s\S]*?)`/g)) {
            errors.push(...validate(schema, parse(match[1])).map(error => new Error(`${path.relative(root, file)}: ${error.message}`)))
            documents++
        }
    }
}
if (errors.length) throw new Error(errors.map(error => error.message).join('\n'))
console.log(`Server syntax and GraphQL schema checked; ${documents} mobile documents validated`)
