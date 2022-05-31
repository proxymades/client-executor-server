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

//create order
async function createOrder(parent, args, context, info) {
    const { phone } = context
    const imageHash = await bcrypt.hash(IMAGE_SECRET, 8)
    const imagePath = args.image ? `images/client/orders/${args.id}.jpg` : ''
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

module.exports = {
    uploadClientAvatar,
    uploadOrderImage,
    deleteClientAvatar,

    clientSignup,
    clientLogin,
    updateClientProfile,
    createOrder,
}