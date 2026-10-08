const { test } = require('node:test')
const assert = require('node:assert/strict')
const { Readable } = require('node:stream')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
process.env.APP_SECRET = 'test-only-secret-not-for-use-outside-tests-12345'
process.env.FIREBASE_ENABLED = 'false'
process.env.ASSETS_DIR = path.join(os.tmpdir(), `clex-test-assets-${process.pid}`)
const Mutation = require('../src/resolvers/Mutation')
const Query = require('../src/resolvers/Query')
const { getAuth, signToken } = require('../src/utils')
const jwt = require('jsonwebtoken')
const { saveImage, imagePath } = require('../src/uploads')
const { ApolloServer } = require('apollo-server-express')
const { typeDefs } = require('../src/typeDefs/schema')
const client = { phone: '1000000000', id: 'client-one', type: 'client' }
const executor = { phone: '2000000000', id: 'executor-one', type: 'executor' }

function matches(row, where = {}) {
    return Object.entries(where).every(([key, value]) => typeof value === 'object' && value !== null
        ? value.in ? value.in.includes(row[key]) : false
        : row[key] === value)
}

function fixture(options = {}) {
    const state = {
        client: [{ ...client, name: 'Client' }], executor: [{ ...executor, name: 'Executor' }],
        order: [
            { id: 'order-one', creator: client.phone, isWork: false, isReady: false },
            { id: 'order-other', creator: '3000000000', isWork: false, isReady: false },
        ],
        orderRequest: [
            { id: 'request-one', orderId: 'order-one', worker: executor.phone, accepted: false, finished: false },
            { id: 'request-other', orderId: 'order-other', worker: '4000000000', accepted: false, finished: false },
        ], feedbackClient: [], feedbackExecutor: [], clientNotificationToken: [], executorNotificationToken: [],
    }
    function models(data) {
        return Object.fromEntries(Object.keys(data).map(name => [name, {
            async findUnique({ where }) { return data[name].find(row => matches(row, where)) || null },
            async findMany({ where }) { return data[name].filter(row => matches(row, where)) },
            async create({ data: row }) {
                if (data[name].some(existing => existing.id === row.id || (row.phone && existing.phone === row.phone))) {
                    const error = new Error('duplicate'); error.code = 'P2002'; throw error
                }
                const created = { accepted: false, finished: false, isWork: false, isReady: false, ...row }
                data[name].push(created); return created
            },
            async update({ where, data: values }) {
                if (name === 'order' && options.failOrderUpdate) throw new Error('Injected order write failure')
                const row = data[name].find(row => matches(row, where))
                if (!row) throw new Error('not found')
                Object.assign(row, values); return row
            },
            async updateMany({ where, data: values }) {
                const rows = data[name].filter(row => matches(row, where)); rows.forEach(row => Object.assign(row, values))
                return { count: rows.length }
            },
            async delete({ where }) {
                const index = data[name].findIndex(row => matches(row, where))
                if (index < 0) throw new Error('not found')
                return data[name].splice(index, 1)[0]
            },
            async deleteMany({ where }) {
                const rows = data[name].filter(row => !matches(row, where))
                const count = data[name].length - rows.length; data[name] = rows; return { count }
            },
        }]))
    }
    const prisma = models(state)
    prisma.$transaction = async callback => {
        const staged = structuredClone(state)
        const result = await callback({ ...models(staged), $queryRaw: async () => [] })
        for (const key of Object.keys(state)) state[key] = staged[key]
        return result
    }
    return { state, prisma, client: { ...client, prisma }, executor: { ...executor, prisma } }
}

const args = { orderId: 'order-one', requestId: 'request-one' }
const rejected = promise => assert.rejects(promise, /прав|доступ|Войдите|работе|заверш|участникам|идентификатор|поле|Оценка|количество/)

test('private queries reject guests, wrong roles and foreign order IDs', async () => {
    const f = fixture()
    assert.throws(() => Query.clientNewOrders(null, {}, { prisma: f.prisma }), /Войдите/)
    assert.throws(() => Query.clientProfile(null, {}, f.executor), /прав/)
    await rejected(Query.clientOrder(null, { id: 'order-other' }, f.client))
    await rejected(Query.clientOrderRequests(null, { orderId: 'order-other' }, f.client))
    assert.equal((await Query.clientOrder(null, { id: 'order-one' }, f.client)).id, 'order-one')
})

test('push registration cannot attach or delete a token for another account', async () => {
    const f = fixture()
    await rejected(Mutation.registerClientNotificationToken(null, { id: 'push-one', phone: '3000000000', token: 'device-token' }, f.client))
    await rejected(Mutation.deleteClientNotificationToken(null, { phone: '3000000000', token: 'device-token' }, f.client))
    await rejected(Mutation.registerClientNotificationToken(null, { id: 'push-one', phone: client.phone, token: 'device-token' }, f.executor))
    await Mutation.registerClientNotificationToken(null, { id: 'push-one', phone: client.phone, token: 'device-token' }, f.client)
    await Mutation.registerClientNotificationToken(null, { id: 'push-two', phone: client.phone, token: 'device-token' }, f.client)
    assert.equal(f.state.clientNotificationToken.length, 1)
})

test('all order transitions reject foreign current and previous request IDs without changes', async () => {
    for (const name of ['acceptOrderRequest', 'repulseOrderRequest', 'acceptOrderWork', 'repulseOrderWork']) {
        const f = fixture()
        const before = structuredClone(f.state)
        await rejected(Mutation[name](null, { ...args, requestId: 'request-other' }, f.client))
        assert.deepEqual(f.state, before, name)
        await rejected(Mutation[name](null, args, f.executor))
    }
    const f = fixture()
    await rejected(Mutation.acceptOrderRequest(null, { ...args, previousRequestId: 'request-other' }, f.client))
    assert.equal(f.state.orderRequest[0].accepted, false)
})

test('choosing a worker resets only this order and saves order/request together', async () => {
    const f = fixture()
    f.state.orderRequest.push({ id: 'request-previous', orderId: 'order-one', worker: '5000000000', accepted: true, finished: false })
    f.state.orderRequest[1].accepted = true
    await Mutation.acceptOrderRequest(null, args, f.client)
    assert.equal(f.state.order[0].isWork, true)
    assert.equal(f.state.orderRequest[0].accepted, true)
    assert.equal(f.state.orderRequest[2].accepted, false)
    assert.equal(f.state.orderRequest[1].accepted, true)
    await Mutation.acceptOrderWork(null, args, f.client)
    assert.equal(f.state.order[0].isWork, false)
    assert.equal(f.state.order[0].isReady, true)
    assert.equal(f.state.orderRequest[0].finished, true)
    await rejected(Mutation.acceptOrderWork(null, args, f.client))
})

test('pending cancellation works; accepted and completed requests cannot be cancelled by executor', async () => {
    const f = fixture()
    await Mutation.cancelOrderRequest(null, { orderId: 'order-one' }, f.executor)
    assert.equal(f.state.orderRequest.some(r => r.id === 'request-one'), false)
    const accepted = fixture()
    await Mutation.acceptOrderRequest(null, args, accepted.client)
    await rejected(Mutation.cancelOrderRequest(null, { orderId: 'order-one' }, accepted.executor))
    await Mutation.acceptOrderWork(null, args, accepted.client)
    await rejected(Mutation.cancelOrderRequest(null, { orderId: 'order-one' }, accepted.executor))
})

test('cancelling and rejecting work return the order to the feed', async () => {
    for (const name of ['repulseOrderRequest', 'repulseOrderWork']) {
        const f = fixture()
        await Mutation.acceptOrderRequest(null, args, f.client)
        await Mutation[name](null, args, f.client)
        assert.equal(f.state.order[0].isWork, false)
        assert.equal(f.state.order[0].isReady, false)
        const request = f.state.orderRequest.find(r => r.id === 'request-one')
        if (name === 'repulseOrderRequest') assert.equal(request.accepted, false)
        else assert.equal(request, undefined)
    }
})

test('feedback requires a completed order and its actual participants; duplicates return false', async () => {
    const f = fixture()
    const feedback = { id: 'feedback-one', orderId: 'order-one', rating: 5, message: 'Спасибо', toUser: executor.phone }
    await rejected(Mutation.writeFeedbackExecutor(null, feedback, f.client))
    await Mutation.acceptOrderRequest(null, args, f.client)
    await Mutation.acceptOrderWork(null, args, f.client)
    await rejected(Mutation.writeFeedbackExecutor(null, { ...feedback, toUser: '4000000000' }, f.client))
    assert.equal(await Mutation.writeFeedbackExecutor(null, feedback, f.client), true)
    assert.equal(await Mutation.writeFeedbackExecutor(null, { ...feedback, id: 'feedback-duplicate' }, f.client), false)
    const clientFeedback = { ...feedback, id: 'feedback-client', toUser: client.phone }
    await rejected(Mutation.writeFeedbackClient(null, clientFeedback, { ...f.executor, phone: '4000000000' }))
    assert.equal(await Mutation.writeFeedbackClient(null, clientFeedback, f.executor), true)
    assert.equal(f.state.feedbackClient.length, 1)
})

test('signup/login issue expiring tokens; invalid, expired and non-expiring tokens are rejected', async () => {
    const f = fixture()
    const signup = { id: 'new-client', phone: '6000000000', name: ' Test ', password: 'password123' }
    const result = await Mutation.clientSignup(null, signup, { prisma: f.prisma })
    assert.equal(jwt.decode(result.token).exp - jwt.decode(result.token).iat, 7 * 24 * 60 * 60)
    assert.equal(getAuth({ headers: { authorization: `Bearer ${result.token}` } }).phone, signup.phone)
    const logged = await Mutation.clientLogin(null, { phone: signup.phone, password: signup.password }, { prisma: f.prisma })
    assert.equal(logged.client.name, 'Test')
    await assert.rejects(Mutation.clientLogin(null, { phone: signup.phone, password: 'wrong' }, { prisma: f.prisma }), /Неверный/)
    for (const token of [
        'invalid',
        jwt.sign(client, process.env.APP_SECRET, { expiresIn: -1 }),
        jwt.sign(client, process.env.APP_SECRET),
        jwt.sign(client, 'other-key', { expiresIn: '1d' }),
    ]) assert.throws(() => getAuth({ headers: { authorization: `Bearer ${token}` } }), /Сессия/)
    assert.equal(getAuth({ headers: {} }).phone, null)
    assert.equal(getAuth({ headers: { authorization: `Bearer ${signToken(executor, 'executor')}` } }).type, 'executor')
})

test('order uploads reject unauthorized accounts before opening the stream', async () => {
    const f = fixture()
    const file = Promise.resolve({ createReadStream() { throw new Error('Stream must not open') } })
    await rejected(Mutation.uploadOrderImage(null, { orderId: 'order-other', file }, f.client))
    await rejected(Mutation.uploadOrderImage(null, { orderId: 'order-one', file }, f.executor))
    await rejected(Mutation.uploadOrderImage(null, { orderId: '../escape', file }, f.client))
})

test('image upload validates signatures and atomically replaces a file without leaving partial uploads', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'clex-upload-test-'))
    const target = path.join(dir, 'image.jpg')
    const jpeg = Buffer.from([255, 216, 255, 224, 0, 16, 74, 70, 73, 70])
    function file(data) { return Promise.resolve({ filename: 'image.jpg', mimetype: 'image/jpeg', createReadStream: () => Readable.from([data]) }) }
    try {
        await saveImage(file(jpeg), target)
        await assert.rejects(saveImage(file(Buffer.from('not an image')), target), /Некорректный/)
        assert.deepEqual(await fs.readFile(target), jpeg)
        assert.deepEqual(await fs.readdir(dir), ['image.jpg'])
        assert.throws(() => imagePath('client', 'orders', '../escape'), /идентификатор/)
    } finally { await fs.rm(dir, { recursive: true, force: true }) }
})

test('server validates order values and ratings before writing', async () => {
    const f = fixture()
    await rejected(Mutation.createOrder(null, { id: 'new-order', count: '0' }, f.client))
    await rejected(Mutation.writeFeedbackExecutor(null, { id: 'feedback-one', rating: 10 }, f.client))
    assert.equal(f.state.order.length, 2)
})

test('GraphQL returns explicit authentication and access errors', async () => {
    const f = fixture()
    const server = new ApolloServer({ typeDefs, resolvers: { Query, Mutation }, context: () => f.executor })
    try {
        const response = await server.executeOperation({ query: '{ clientOrder(id: "order-one") { id } }' })
        assert.equal(response.errors[0].extensions.code, 'FORBIDDEN')
    } finally { await server.stop() }
})


test('a failed order write rolls back the selected request and previous selection', async () => {
    const f = fixture({ failOrderUpdate: true })
    const before = structuredClone(f.state)
    await assert.rejects(Mutation.acceptOrderRequest(null, args, f.client), /Injected order write failure/)
    assert.deepEqual(f.state, before)
})

test('a Firebase credential failure does not undo a saved order transition', async () => {
    const config = require('../src/config')
    const enabled = config.firebaseEnabled, account = config.firebaseServiceAccount
    const warn = console.warn
    const warnings = []
    config.firebaseEnabled = true
    config.firebaseServiceAccount = '/clex-test-no-such-credential.json'
    console.warn = message => warnings.push(message)
    try {
        const f = fixture()
        await Mutation.acceptOrderRequest(null, args, f.client)
        assert.equal(f.state.order[0].isWork, true)
        assert.equal(f.state.orderRequest[0].accepted, true)
        assert.equal(warnings.length, 1)
        assert.equal(warnings[0].includes('credential'), false)
    } finally {
        config.firebaseEnabled = enabled
        config.firebaseServiceAccount = account
        console.warn = warn
    }
})
