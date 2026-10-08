const { test } = require('node:test')
const assert = require('node:assert/strict')
process.env.APP_SECRET = 'http-test-only-secret-at-least-32-characters'
process.env.FIREBASE_ENABLED = 'false'
process.env.DATABASE_URL = 'mysql://unused:unused@127.0.0.1:1/unused'
const config = require('../src/config')
config.port = 0
const { start } = require('../src/index')

test('HTTP startup works without Firebase; CSRF, CORS and guest authorization are enforced', async () => {
    const running = await start()
    const url = `http://127.0.0.1:${running.httpServer.address().port}/graphql`
    try {
        const response = await fetch(url, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Origin: config.corsOrigins[0] },
            body: JSON.stringify({ query: '{ clientNewOrders { id } }' }),
        })
        assert.equal(response.headers.get('access-control-allow-origin'), config.corsOrigins[0])
        assert.equal((await response.json()).errors[0].extensions.code, 'UNAUTHENTICATED')
        const invalid = await fetch(url, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer invalid' },
            body: JSON.stringify({ query: '{ clientNewOrders { id } }' }),
        })
        assert.equal((await invalid.json()).errors[0].extensions.code, 'UNAUTHENTICATED')
        const csrf = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' })
        assert.equal(csrf.status, 400)
    } finally { await running.shutdown() }
})
