//core
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//utils
const { APP_SECRET } = require('../utils')

// RESOLVERS

// --------- client ------------
//signup
async function clientSignup(parent, args, context, info) {
    const phone = args.phone
    const password = await bcrypt.hash(args.password, 12)
    const findedAccount = await context.prisma.client.findUnique({
        where: {
            phone: phone,
        }
    })
    if (findedAccount) {
        throw new Error('Номер телефона уже используется')
    }
    const client = await context.prisma.client.create({
        data: {
            id: args.id,
            phone: phone,
            password: password,
            fullName: args.fullName,
        }
    })
    const token = jwt.sign({
        phone: client.phone,
        id: client.id
    }, APP_SECRET)
    return { token }
}

//login
async function clientLogin(parent, args, context, info) {
    const findedAccount = await context.prisma.client.findUnique({
        where: {
            phone: args.phone
        }
    })
    if (!findedAccount) {
        throw new Error('Пользователь не найден')
    }
    const valid = await bcrypt.compare(args.password, findedAccount.password)
    if (!valid) {
        throw new Error('Неверный пароль')
    }
    const token = jwt.sign({
        phone: findedAccount.phone,
        id: findedAccount.id
    }, APP_SECRET)
    return { token, findedAccount }
}

module.exports = {
    clientSignup,
    clientLogin,
}