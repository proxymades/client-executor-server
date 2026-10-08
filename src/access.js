const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express')

function requireRole(context, role) {
    if (!context.phone || !context.id) throw new AuthenticationError('Войдите в аккаунт')
    if (context.type !== role) throw new ForbiddenError('Недостаточно прав')
}

function requireOwnPhone(context, phone, role) {
    requireRole(context, role)
    if (phone !== context.phone) throw new ForbiddenError('Недостаточно прав')
}

function identifier(value) {
    if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(value)) {
        throw new UserInputError('Некорректный идентификатор')
    }
    return value
}

async function ownedOrder(prisma, orderId, phone) {
    const order = await prisma.order.findUnique({ where: { id: identifier(orderId) } })
    if (!order || order.creator !== phone) throw new ForbiddenError('Заказ недоступен')
    return order
}

async function requestForOrder(prisma, requestId, orderId) {
    const request = await prisma.orderRequest.findUnique({ where: { id: identifier(requestId) } })
    if (!request || request.orderId !== orderId) throw new ForbiddenError('Заявка недоступна')
    return request
}

// Every order mutation takes the same MySQL row lock before checking its state.
// The lock also serializes duplicate requests and feedback without changing the DB schema.
async function withOrderTransaction(prisma, orderId, action) {
    identifier(orderId)
    return prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id = ${orderId} FOR UPDATE`
        return action(tx)
    })
}

module.exports = { requireRole, requireOwnPhone, identifier, ownedOrder, requestForOrder, withOrderTransaction }
