const { execFileSync } = require('node:child_process')
const path = require('node:path')
const root = path.resolve(__dirname, '..')
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
const bad = new Set()
function inspect(name, content) {
    const actualName = name.replace(/^history:/, '')
    const base = path.basename(actualName)
    if ((/^\.env(?:\.|$)/.test(base) && base !== '.env.example') || actualName === 'config/local.json') bad.add(name)
    if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content) ||
        /"type"\s*:\s*"service_account"/.test(content) ||
        /(?:const|let|var)\s+(?:APP_SECRET|IMAGE_SECRET)\s*=\s*['"`][^'"`]+['"`]/.test(content)) bad.add(name)
}
for (const file of git(['ls-files', '-z']).split('\0').filter(Boolean)) {
    inspect(file, git(['show', `:${file}`]))
}
if (process.argv.includes('--history')) {
    for (const line of git(['rev-list', '--objects', '--all']).split('\n')) {
        const match = line.match(/^([a-f0-9]+) (.+)$/)
        if (!match) continue
        const [, object, file] = match
        if (!/(^|\/)\.env(?:\.|$)|firebase-adminsdk|service-account|(^|\/)src\/utils\.js$/.test(file)) continue
        if (git(['cat-file', '-t', object]).trim() !== 'blob') continue
        inspect(`history:${file}`, git(['cat-file', 'blob', object]))
    }
}
if (bad.size) {
    console.error('Files requiring review before publication (contents hidden):\n' + [...bad].join('\n'))
    process.exitCode = 1
} else console.log('Git index passed the targeted private-file check' + (process.argv.includes('--history') ? ' including selected historical paths' : ' (history not checked)'))
