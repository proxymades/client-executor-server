//core
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//utils
const { APP_SECRET } = require('../utils')

// RESOLVERS

//signup
async function signup(parent, args, context, info) {
    const username = args.username
    const password = await bcrypt.hash(args.password, 12)
    const userPhone = await context.prisma.user.findUnique({
        where: {
            regPhone: args.regPhone,
        }
    })
    if (userPhone) {
        throw new Error('Номер телефона уже используется')
    }
    const user = await context.prisma.user.create({
        data: {
            id: args.id,
            username: username,
            password: password,
            regPhone: args.regPhone,
            fullName: args.fullName,
        }
    })
    const token = jwt.sign({
        username: user.username,
        id: user.id
    }, APP_SECRET)
    return { token }
}

//login
async function login(parent, args, context, info) {
    const user = await context.prisma.user.findUnique({
        where: {
            username: args.username
        }
    })
    if (!user) {
        throw new Error('Пользователь не найден')
    }
    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) {
        throw new Error('Неверный пароль')
    }
    const token = jwt.sign({
        username: user.username,
        id: user.id
    }, APP_SECRET)
    return { token, user }
}

module.exports = {
    signup,
    login,
}