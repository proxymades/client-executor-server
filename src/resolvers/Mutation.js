const bcrypt = require('bcryptjs')
const { randomUUID } = require('node:crypto')
const { UserInputError, ForbiddenError, AuthenticationError } = require('apollo-server-express')
const { signToken } = require('../utils')
const { requireRole, requireOwnPhone, identifier, ownedOrder, requestForOrder, withOrderTransaction } = require('../access')
const validate = require('../validation')
const { notify } = require('../notifications')
const { imagePath, saveImage, deleteImage } = require('../uploads')

function imageReference(role, kind, id, present) {
    return present ? `images/${role}/${kind}/${identifier(id)}.jpg?sh=${randomUUID()}` : ''
}

async function registerNotificationToken(args, context, role) {
    requireOwnPhone(context, args.phone, role)
    identifier(args.id)
    const token = validate.text(args.token, 'push-токен', 300)
    const model = context.prisma[`${role}NotificationToken`]
    const existing = await model.findMany({ where: { phone: context.phone, token } })
    if (!existing.length) await model.create({ data: { id: args.id, phone: context.phone, token } })
}

async function deleteNotificationToken(args, context, role) {
    requireOwnPhone(context, args.phone, role)
    const token = validate.text(args.token, 'push-токен', 300)
    await context.prisma[`${role}NotificationToken`].deleteMany({ where: { phone: context.phone, token } })
}

async function signup(args, context, role) {
    identifier(args.id)
    const phone = validate.phone(args.phone)
    const name = validate.text(args.name, 'имя', 90).replace(/\s+/g, ' ')
    const password = await bcrypt.hash(validate.password(args.password, true), 12)
    const model = context.prisma[role]
    if (await model.findUnique({ where: { phone } })) throw new UserInputError('Номер телефона уже используется')
    let user
    try {
        user = await model.create({ data: { id: args.id, phone, password, name } })
    } catch (error) {
        if (error.code === 'P2002') throw new UserInputError('Аккаунт уже существует')
        throw error
    }
    return { token: signToken(user, role), [role]: user }
}

async function login(args, context, role) {
    const phone = validate.phone(args.phone)
    const password = validate.password(args.password)
    const user = await context.prisma[role].findUnique({ where: { phone } })
    if (!user || !await bcrypt.compare(password, user.password)) {
        throw new AuthenticationError('Неверный телефон или пароль')
    }
    return { token: signToken(user, role), [role]: user }
}

async function updateProfile(args, context, role) {
    requireOwnPhone(context, args.phone, role)
    // Avatar references always belong to the authenticated account, never args.avatar.
    const name = validate.text(args.name, 'имя', 90).replace(/\s+/g, ' ')
    await context.prisma[role].update({ where: { phone: context.phone }, data: {
        name, avatar: imageReference(role, 'avatars', context.id, Boolean(args.avatar)),
    } })
    if (!args.avatar) await deleteImage(imagePath(role, 'avatars', context.id))
}

async function uploadAvatar(file, context, role) {
    requireRole(context, role)
    await saveImage(file, imagePath(role, 'avatars', context.id))
}

async function deleteAvatar(args, context, role) {
    requireOwnPhone(context, args.phone, role)
    await context.prisma[role].update({ where: { phone: context.phone }, data: { avatar: '' } })
    await deleteImage(imagePath(role, 'avatars', context.id))
}

async function uploadOrderImage(parent, { file, orderId }, context) {
    requireRole(context, 'client')
    await ownedOrder(context.prisma, orderId, context.phone)
    await saveImage(file, imagePath('client', 'orders', orderId))
}

async function deleteOrderImage(parent, args, context) {
    requireRole(context, 'client')
    await withOrderTransaction(context.prisma, args.orderId, async tx => {
        await ownedOrder(tx, args.orderId, context.phone)
        await tx.order.update({ where: { id: args.orderId }, data: { image: '' } })
    })
    await deleteImage(imagePath('client', 'orders', args.orderId))
}

async function createOrder(parent, args, context) {
    requireRole(context, 'client')
    const data = validate.orderInput(args)
    return context.prisma.order.create({ data: {
        ...data, id: args.id, creator: context.phone,
        image: imageReference('client', 'orders', args.id, Boolean(args.image)),
    } })
}

async function updateOrder(parent, args, context) {
    requireRole(context, 'client')
    const data = validate.orderInput(args)
    await withOrderTransaction(context.prisma, args.id, async tx => {
        await ownedOrder(tx, args.id, context.phone)
        await tx.order.update({ where: { id: args.id }, data: {
            ...data, image: imageReference('client', 'orders', args.id, Boolean(args.image)),
        } })
    })
    if (!args.image) await deleteImage(imagePath('client', 'orders', args.id))
}

async function deleteOrder(parent, args, context) {
    requireRole(context, 'client')
    await withOrderTransaction(context.prisma, args.id, async tx => {
        await ownedOrder(tx, args.id, context.phone)
        await tx.order.delete({ where: { id: args.id } })
    })
    await deleteImage(imagePath('client', 'orders', args.id))
}

async function createOrderRequest(parent, args, context) {
    requireRole(context, 'executor')
    identifier(args.id)
    const offer = validate.money(args.offer)
    const result = await withOrderTransaction(context.prisma, args.orderId, async tx => {
        const order = await tx.order.findUnique({ where: { id: args.orderId } })
        if (!order || order.creator === context.phone) throw new ForbiddenError('Заказ недоступен')
        const existing = await tx.orderRequest.findMany({ where: { orderId: args.orderId, worker: context.phone } })
        if (existing.length) return { status: 'exist' }
        if (order.isWork || order.isReady) return { status: 'worked' }
        await tx.orderRequest.create({ data: { id: args.id, offer, worker: context.phone, orderId: args.orderId } })
        return { status: 'ok', creator: order.creator }
    })
    if (result.status === 'ok') await notify(context.prisma, 'client', result.creator, 'Новая заявка к вашему заказу', 'request')
    return result.status
}

async function cancelOrderRequest(parent, args, context) {
    requireRole(context, 'executor')
    const creator = await withOrderTransaction(context.prisma, args.orderId, async tx => {
        const order = await tx.order.findUnique({ where: { id: args.orderId } })
        if (!order) throw new ForbiddenError('Заказ недоступен')
        const requests = await tx.orderRequest.findMany({ where: { orderId: args.orderId, worker: context.phone } })
        if (!requests.length) throw new ForbiddenError('Заявка недоступна')
        if (order.isWork || order.isReady || requests.some(r => r.accepted || r.finished)) {
            throw new UserInputError('Нельзя отменить заявку на заказ в работе или завершённый заказ')
        }
        await tx.orderRequest.deleteMany({ where: { orderId: args.orderId, worker: context.phone } })
        return order.creator
    })
    await notify(context.prisma, 'client', creator, 'Исполнитель отменил заявку', 'request')
}

async function acceptOrderRequest(parent, args, context) {
    requireRole(context, 'client')
    const worker = await withOrderTransaction(context.prisma, args.orderId, async tx => {
        const order = await ownedOrder(tx, args.orderId, context.phone)
        const request = await requestForOrder(tx, args.requestId, args.orderId)
        if (args.previousRequestId) await requestForOrder(tx, args.previousRequestId, args.orderId)
        if (order.isReady || request.finished) throw new UserInputError('Заказ уже завершён')
        await tx.orderRequest.updateMany({ where: { orderId: args.orderId, accepted: true }, data: { accepted: false } })
        await tx.orderRequest.update({ where: { id: request.id }, data: { accepted: true } })
        await tx.order.update({ where: { id: args.orderId }, data: { isWork: true } })
        return request.worker
    })
    await notify(context.prisma, 'executor', worker, 'Ваша заявка к заказу подтверждена', 'requestAccepting')
}

async function changeWork(args, context, action) {
    requireRole(context, 'client')
    const worker = await withOrderTransaction(context.prisma, args.orderId, async tx => {
        const order = await ownedOrder(tx, args.orderId, context.phone)
        const request = await requestForOrder(tx, args.requestId, args.orderId)
        if (!order.isWork || order.isReady || !request.accepted || request.finished) {
            throw new UserInputError('Заявка не находится в работе')
        }
        if (action === 'finish') {
            await tx.orderRequest.update({ where: { id: request.id }, data: { finished: true } })
        } else if (action === 'cancel') {
            await tx.orderRequest.update({ where: { id: request.id }, data: { accepted: false } })
        } else {
            await tx.orderRequest.delete({ where: { id: request.id } })
        }
        await tx.order.update({ where: { id: args.orderId }, data: { isWork: false, isReady: action === 'finish' } })
        return request.worker
    })
    const messages = {
        finish: 'Поздравляем! Заказ выполнен.',
        cancel: 'Заказчик отменил выполнение работы',
        reject: 'Работа отклонена, к сожалению вы не выполнили заказ',
    }
    await notify(context.prisma, 'executor', worker, messages[action], 'requestAccepting')
}

async function feedback(args, context, role) {
    requireRole(context, role)
    const data = validate.feedbackInput(args)
    const toUser = validate.phone(args.toUser)
    const result = await withOrderTransaction(context.prisma, args.orderId, async tx => {
        const order = await tx.order.findUnique({ where: { id: args.orderId } })
        if (!order || (role === 'client' && order.creator !== context.phone) || (role === 'executor' && order.creator !== toUser)) {
            throw new ForbiddenError('Заказ недоступен')
        }
        const worker = role === 'executor' ? context.phone : toUser
        const requests = await tx.orderRequest.findMany({ where: { orderId: args.orderId, worker, accepted: true, finished: true } })
        if (!order.isReady || !requests.length) throw new ForbiddenError('Отзыв доступен только участникам выполненного заказа')
        const model = role === 'client' ? tx.feedbackExecutor : tx.feedbackClient
        const existing = await model.findMany({ where: { orderId: args.orderId, whoUser: context.phone } })
        if (existing.length) return false
        await model.create({ data: { ...data, whoUser: context.phone, toUser, orderId: args.orderId } })
        return true
    })
    if (result && data.message) {
        await notify(context.prisma, role === 'client' ? 'executor' : 'client', toUser, 'Вам оставлен новый отзыв', role === 'client' ? 'feedbackExecutor' : 'feedbackClient')
    }
    return result
}

module.exports = {
    registerClientNotificationToken: (p, args, ctx) => registerNotificationToken(args, ctx, 'client'),
    registerExecutorNotificationToken: (p, args, ctx) => registerNotificationToken(args, ctx, 'executor'),
    deleteClientNotificationToken: (p, args, ctx) => deleteNotificationToken(args, ctx, 'client'),
    deleteExecutorNotificationToken: (p, args, ctx) => deleteNotificationToken(args, ctx, 'executor'),
    clientSignup: (p, args, ctx) => signup(args, ctx, 'client'),
    executorSignup: (p, args, ctx) => signup(args, ctx, 'executor'),
    clientLogin: (p, args, ctx) => login(args, ctx, 'client'),
    executorLogin: (p, args, ctx) => login(args, ctx, 'executor'),
    updateClientProfile: (p, args, ctx) => updateProfile(args, ctx, 'client'),
    updateExecutorProfile: (p, args, ctx) => updateProfile(args, ctx, 'executor'),
    uploadClientAvatar: (p, { file }, ctx) => uploadAvatar(file, ctx, 'client'),
    uploadExecutorAvatar: (p, { file }, ctx) => uploadAvatar(file, ctx, 'executor'),
    deleteClientAvatar: (p, args, ctx) => deleteAvatar(args, ctx, 'client'),
    deleteExecutorAvatar: (p, args, ctx) => deleteAvatar(args, ctx, 'executor'),
    uploadOrderImage, deleteOrderImage, createOrder, updateOrder, deleteOrder,
    createOrderRequest, cancelOrderRequest, acceptOrderRequest,
    repulseOrderRequest: (p, args, ctx) => changeWork(args, ctx, 'cancel'),
    acceptOrderWork: (p, args, ctx) => changeWork(args, ctx, 'finish'),
    repulseOrderWork: (p, args, ctx) => changeWork(args, ctx, 'reject'),
    writeFeedbackExecutor: (p, args, ctx) => feedback(args, ctx, 'client'),
    writeFeedbackClient: (p, args, ctx) => feedback(args, ctx, 'executor'),
}
