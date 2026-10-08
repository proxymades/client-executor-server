const { test } = require('node:test')
const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')
process.env.APP_SECRET = 'mysql-test-only-secret-at-least-32-characters'
process.env.FIREBASE_ENABLED = 'false'
const { PrismaClient } = require('@prisma/client')
const Mutation = require('../src/resolvers/Mutation')

test('MySQL: concurrent offers, worker switching, completion and feedback remain consistent', { skip: !process.env.TEST_DATABASE_URL }, async () => {
    // TEST_DATABASE_URL must point to a separate test database with the Prisma schema.
    const prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
    const suffix = randomUUID().replace(/-/g, '')
    const phone = () => `9${String(Math.floor(Math.random() * 1e15)).padStart(15, '0')}`
    const clientPhone = phone(), executorPhone = phone(), otherPhone = phone()
    const orderId = `test-order-${suffix}`
    try {
        const clientUser = await prisma.client.create({ data: { id: `test-client-${suffix}`, phone: clientPhone, name: 'Test client', password: 'test-only' } })
        const worker = await prisma.executor.create({ data: { id: `test-worker-${suffix}`, phone: executorPhone, name: 'Test worker', password: 'test-only' } })
        const other = await prisma.executor.create({ data: { id: `test-other-${suffix}`, phone: otherPhone, name: 'Test other', password: 'test-only' } })
        const client = { prisma, ...clientUser, type: 'client' }
        const executor = { prisma, ...worker, type: 'executor' }
        const otherExecutor = { prisma, ...other, type: 'executor' }
        await Mutation.createOrder(null, { id: orderId, header: 'Test', category: 'polygraphy', count: '10', text: 'Test order', city: 'almaty', urgent: false, image: '' }, client)
        const requestId = `test-request-${suffix}`
        const offers = await Promise.all([
            Mutation.createOrderRequest(null, { id: requestId, orderId, offer: '100' }, executor),
            Mutation.createOrderRequest(null, { id: `test-duplicate-${suffix}`, orderId, offer: '200' }, executor),
        ])
        assert.deepEqual(offers.sort(), ['exist', 'ok'])
        const ownRequest = await prisma.orderRequest.findFirst({ where: { orderId, worker: executorPhone } })
        const otherRequestId = `test-other-request-${suffix}`
        await Mutation.createOrderRequest(null, { id: otherRequestId, orderId, offer: '300' }, otherExecutor)
        await Promise.all([
            Mutation.acceptOrderRequest(null, { orderId, requestId: ownRequest.id }, client),
            Mutation.acceptOrderRequest(null, { orderId, requestId: otherRequestId }, client),
        ])
        const accepted = await prisma.orderRequest.findMany({ where: { orderId, accepted: true } })
        assert.equal(accepted.length, 1)
        assert.equal((await prisma.order.findUnique({ where: { id: orderId } })).isWork, true)
        await Mutation.acceptOrderWork(null, { orderId, requestId: accepted[0].id }, client)
        assert.equal((await prisma.order.findUnique({ where: { id: orderId } })).isReady, true)
        const feedback = { orderId, toUser: accepted[0].worker, rating: 5, message: 'Test' }
        const results = await Promise.all([
            Mutation.writeFeedbackExecutor(null, { ...feedback, id: `test-feedback-${suffix}` }, client),
            Mutation.writeFeedbackExecutor(null, { ...feedback, id: `test-feedback-duplicate-${suffix}` }, client),
        ])
        assert.deepEqual(results.sort(), [false, true])
    } finally {
        await prisma.order.deleteMany({ where: { id: orderId } })
        await prisma.client.deleteMany({ where: { id: `test-client-${suffix}` } })
        await prisma.executor.deleteMany({ where: { id: { in: [`test-worker-${suffix}`, `test-other-${suffix}`] } } })
        await prisma.$disconnect()
    }
})
