const jwt = require('jsonwebtoken')
const { AuthenticationError } = require('apollo-server-express')
const { appSecret, tokenTtl } = require('./config')

if (!appSecret || appSecret.length < 32) {
    throw new Error('Set APP_SECRET to a random secret of at least 32 characters in .env')
}

function getAuth(req) {
    const header = req && req.headers.authorization
    if (!header) return { phone: null, id: null, type: null }
    try {
        if (!/^Bearer \S+$/.test(header)) throw new Error('Invalid authorization header')
        const payload = jwt.verify(header.slice(7), appSecret, { algorithms: ['HS256'] })
        if (!/^[0-9]{10,20}$/.test(payload.phone) ||
            !/^[a-zA-Z0-9_-]{1,128}$/.test(payload.id) ||
            !['client', 'executor'].includes(payload.type) || !Number.isFinite(payload.exp)) {
            throw new Error('Invalid token payload')
        }
        return { phone: payload.phone, id: payload.id, type: payload.type }
    } catch {
        throw new AuthenticationError('Сессия завершена. Войдите снова')
    }
}

function signToken(user, type) {
    return jwt.sign({ phone: user.phone, id: user.id, type }, appSecret, {
        algorithm: 'HS256', expiresIn: tokenTtl,
    })
}

module.exports = { getAuth, signToken }
