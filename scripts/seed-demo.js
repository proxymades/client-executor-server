const bcrypt = require('bcryptjs')
require('../src/config')
const { PrismaClient } = require('@prisma/client')

async function main() {
    if (process.env.ALLOW_DEMO_SEED !== 'true' || process.env.NODE_ENV === 'production') {
        throw new Error('Use ALLOW_DEMO_SEED=true with a separate development database')
    }
    const prisma = new PrismaClient()
    try {
        const password = await bcrypt.hash('demo-password-123', 12)
        const users = [
            { model: 'client', id: 'demo-client', phone: '1000000000', name: 'Demo customer' },
            { model: 'executor', id: 'demo-executor', phone: '2000000000', name: 'Demo contractor' },
        ]
        for (const user of users) {
            const model = prisma[user.model]
            const existing = await model.findUnique({ where: { phone: user.phone } })
            if (existing && existing.id !== user.id) throw new Error('Demo phone belongs to a different account; use an empty demo database')
            const { model: ignored, ...data } = user
            await model.upsert({ where: { phone: user.phone }, create: { ...data, password }, update: {} })
        }
        await prisma.order.upsert({
            where: { id: 'demo-order' }, update: {}, create: {
                id: 'demo-order', creator: users[0].phone, header: 'Print 100 business cards',
                category: 'polygraphy', count: '100', text: 'Synthetic portfolio order. No real customer data.',
                city: 'almaty', urgent: false, image: '',
            },
        })
        console.log('Demo accounts: customer 1000000000, contractor 2000000000; password: demo-password-123')
    } finally { await prisma.$disconnect() }
}
main().catch(() => {
    console.error('Demo seed failed. Check the development database and ALLOW_DEMO_SEED flag.')
    process.exitCode = 1
})
