//core
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const { finished } = require('stream/promises')

//utils
const { APP_SECRET, IMAGE_SECRET } = require('../utils')
const { IMAGES_URI } = require('../uri')

// RESOLVERS

// --------- client ------------

//upload avatar
async function uploadClientAvatar(parent, { file }, context) {
    const { id } = context
    const { createReadStream, filename, encoding, mimetype } = await file
    const { ext } = path.parse(filename)
    const validType = /\.(jpe?g|png)$/i.test(ext)
    if (!validType) {
        return new Error("Вы можете загружать только картинки")
    }
    const pathName = path.join(
        __dirname,
        `${IMAGES_URI}/images/client/avatars/${id}.jpg`
    )
    const stream = createReadStream()
    const out = fs.createWriteStream(pathName)
    stream.pipe(out)
    await finished(out)
}

//upload order image
async function uploadOrderImage(parent, { file, orderId }, context) {
    const { createReadStream, filename, encoding, mimetype } = await file
    const { ext } = path.parse(filename)
    const validType = /\.(jpe?g|png)$/i.test(ext)
    if (!validType) {
        return new Error("Вы можете загружать только картинки")
    }
    const pathName = path.join(
        __dirname,
        `${IMAGES_URI}/images/client/orders/${orderId}.jpg`
    )
    const stream = createReadStream()
    const out = fs.createWriteStream(pathName)
    stream.pipe(out)
    await finished(out)
}

//delete client avatar
async function deleteClientAvatar(parent, args, context, info) {
    const { phone, id } = context
    const pathName = path.join(
        __dirname,
        `${IMAGES_URI}/images/client/avatars/${id}.jpg`
    )
    if (phone === args.phone) {
        await context.prisma.client.update({
            where: {
                phone: phone
            },
            data: {
                avatar: ''
            }
        })
        fs.existsSync(pathName) && fs.unlinkSync(pathName)
    }
}

//delete order image
async function deleteOrderImage(parent, args, context, info) {
    const orderId = args.orderId
    const { phone } = context
    const pathName = path.join(
        __dirname,
        `${IMAGES_URI}/images/client/orders/${orderId}.jpg`
    )
    const order = await context.prisma.order.findUnique({
        where: {
            id: orderId
        }
    })
    if (order.creator === phone) {
        await context.prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                image: ''
            }
        })
        fs.existsSync(pathName) && fs.unlinkSync(pathName)
    }
}

//signup
async function clientSignup(parent, args, context, info) {
    const phone = args.phone
    const password = await bcrypt.hash(args.password, 12)
    const findedClient = await context.prisma.client.findUnique({
        where: {
            phone: phone,
        }
    })
    if (findedClient) {
        throw new Error('Номер телефона уже используется')
    }
    const client = await context.prisma.client.create({
        data: {
            id: args.id,
            phone: phone,
            password: password,
            name: args.name.trim().replaceAll('\n', ' '),
        }
    })
    const token = jwt.sign({
        phone: client.phone,
        type: 'client',
        id: client.id
    }, APP_SECRET)
    return { token }
}

//login
async function clientLogin(parent, args, context, info) {
    const findedClient = await context.prisma.client.findUnique({
        where: {
            phone: args.phone
        }
    })
    if (!findedClient) {
        throw new Error('Пользователь не найден')
    }
    const valid = await bcrypt.compare(args.password, findedClient.password)
    if (!valid) {
        throw new Error('Неверный пароль')
    }
    const token = jwt.sign({
        phone: findedClient.phone,
        type: 'client',
        id: findedClient.id
    }, APP_SECRET)
    return { token, findedClient }
}

//update client profile
async function updateClientProfile(parent, args, context, info) {
    const { phone, id } = context
    const avatarImagePath = path.join(
        __dirname,
        `${IMAGES_URI}/images/client/avatars/${id}.jpg`
    )
    const imageHash = await bcrypt.hash(IMAGE_SECRET, 8)
    const avatarImage = args.avatar ? `images/client/avatars/${args.avatar}.jpg` : ''
    const avatar = args.avatar ? `${avatarImage.split('?')[0]}?sh=${imageHash}` : ''
    if (phone === args.phone) {
        await context.prisma.client.update({
            where: {
                phone: args.phone
            },
            data: {
                name: args.name.trim().replaceAll('\n', ' '),
                avatar: avatar,
            }
        })
        avatar || fs.existsSync(avatarImagePath) && fs.unlinkSync(avatarImagePath)
    }
}

// --------- executor ------------

//upload executor avatar
async function uploadExecutorAvatar(parent, { file }, context) {
    const { id } = context
    const { createReadStream, filename, encoding, mimetype } = await file
    const { ext } = path.parse(filename)
    const validType = /\.(jpe?g|png)$/i.test(ext)
    if (!validType) {
        return new Error("Вы можете загружать только картинки")
    }
    const pathName = path.join(
        __dirname,
        `${IMAGES_URI}/images/executor/avatars/${id}.jpg`
    )
    const stream = createReadStream()
    const out = fs.createWriteStream(pathName)
    stream.pipe(out)
    await finished(out)
}

//delete executor avatar
async function deleteExecutorAvatar(parent, args, context, info) {
    const { phone, id } = context
    const pathName = path.join(
        __dirname,
        `${IMAGES_URI}/images/executor/avatars/${id}.jpg`
    )
    if (phone === args.phone) {
        await context.prisma.executor.update({
            where: {
                phone: phone
            },
            data: {
                avatar: ''
            }
        })
        fs.existsSync(pathName) && fs.unlinkSync(pathName)
    }
}

//signup executor
async function executorSignup(parent, args, context, info) {
    const phone = args.phone
    const password = await bcrypt.hash(args.password, 12)
    const findedExecutor = await context.prisma.executor.findUnique({
        where: {
            phone: phone,
        }
    })
    if (findedExecutor) {
        throw new Error('Номер телефона уже используется')
    }
    const executor = await context.prisma.executor.create({
        data: {
            id: args.id,
            phone: phone,
            password: password,
            name: args.name.trim().replaceAll('\n', ' '),
        }
    })
    const token = jwt.sign({
        phone: executor.phone,
        type: 'executor',
        id: executor.id
    }, APP_SECRET)
    return { token }
}

//login executor
async function executorLogin(parent, args, context, info) {
    const findedExecutor = await context.prisma.executor.findUnique({
        where: {
            phone: args.phone
        }
    })
    if (!findedExecutor) {
        throw new Error('Пользователь не найден')
    }
    const valid = await bcrypt.compare(args.password, findedExecutor.password)
    if (!valid) {
        throw new Error('Неверный пароль')
    }
    const token = jwt.sign({
        phone: findedExecutor.phone,
        type: 'executor',
        id: findedExecutor.id
    }, APP_SECRET)
    return { token, findedExecutor }
}

//update executor profile
async function updateExecutorProfile(parent, args, context, info) {
    const { phone, id } = context
    const avatarImagePath = path.join(
        __dirname,
        `${IMAGES_URI}/images/executor/avatars/${id}.jpg`
    )
    const imageHash = await bcrypt.hash(IMAGE_SECRET, 8)
    const avatarImage = args.avatar ? `images/executor/avatars/${args.avatar}.jpg` : ''
    const avatar = args.avatar ? `${avatarImage.split('?')[0]}?sh=${imageHash}` : ''
    if (phone === args.phone) {
        await context.prisma.executor.update({
            where: {
                phone: args.phone
            },
            data: {
                name: args.name.trim().replaceAll('\n', ' '),
                avatar: avatar,
            }
        })
        avatar || fs.existsSync(avatarImagePath) && fs.unlinkSync(avatarImagePath)
    }
}

//-------- order -----------

//create order
async function createOrder(parent, args, context, info) {
    const { phone } = context
    const imageHash = await bcrypt.hash(IMAGE_SECRET, 8)
    const imagePath = args.image ? `images/executor/orders/${args.id}.jpg` : ''
    const image = args.image ? `${imagePath.split('?')[0]}?sh=${imageHash}` : ''
    return await context.prisma.order.create({
        data: {
            id: args.id,
            header: args.header.trim().replaceAll('\n', ' '),
            category: args.category,
            count: args.count.trim().replaceAll('\n', ' '),
            text: args.text.trim(),
            city: args.city,
            urgent: args.urgent,
            image: image,
            creator: phone,
        }
    })
}

//update order
async function updateOrder(parent, args, context, info) {
    const { phone } = context
    const imageHash = await bcrypt.hash(IMAGE_SECRET, 8)
    const imagePath = args.image ? `images/client/orders/${args.id}.jpg` : ''
    const image = args.image ? `${imagePath.split('?')[0]}?sh=${imageHash}` : ''
    const order = await context.prisma.order.findUnique({
        where: {
            id: args.id
        }
    })
    if (order.creator === phone) {
        await context.prisma.order.update({
            where: {
                id: args.id,
            },
            data: {
                header: args.header.trim().replaceAll('\n', ' '),
                category: args.category,
                count: args.count.trim().replaceAll('\n', ' '),
                text: args.text.trim(),
                city: args.city,
                urgent: args.urgent,
                image: image,
            }
        })
    }
}

//delete order
async function deleteOrder(parent, args, context, info) {
    const { phone } = context
    const imagePath = path.join(
        __dirname,
        `${IMAGES_URI}/images/client/orders/${args.id}.jpg`
    )
    const order = await context.prisma.order.findUnique({
        where: {
            id: args.id,
        }
    })
    if (order.creator === phone) {
        await context.prisma.order.delete({
            where: {
                id: args.id,
            }
        })
        fs.existsSync(imagePath) && fs.unlinkSync(imagePath)
    }
}

module.exports = {
    uploadClientAvatar,
    deleteClientAvatar,

    clientSignup,
    clientLogin,
    updateClientProfile,

    uploadExecutorAvatar,
    deleteExecutorAvatar,

    executorSignup,
    executorLogin,
    updateExecutorProfile,

    uploadOrderImage,
    deleteOrderImage,

    createOrder,
    updateOrder,
    deleteOrder,
}