//core
const jwt = require('jsonwebtoken')
const APP_SECRET = process.env.APP_SECRET
const IMAGE_SECRET = process.env.IMAGE_SECRET

//Получение и верификация токена
function getTokenPayload(token) {
    return jwt.verify(token, APP_SECRET)
}

//get context phone
function getPhone(req, authToken) {
    if (req) {
        const authHeader = req.headers.authorization
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            if (!token) {
                throw new Error('Токен не найден')
            }
            const { phone } = getTokenPayload(token)
            return phone
        }
    } else if (authToken) {
        const { phone } = getTokenPayload(authToken)
        return phone
    }
    throw new Error('Вы не аутентифицированы')
}

//get context id
function getId(req, authToken) {
    if (req) {
        const authHeader = req.headers.authorization
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            if (!token) {
                throw new Error('Токен не найден')
            }
            const { id } = getTokenPayload(token)
            return id
        }
    } else if (authToken) {
        const { id } = getTokenPayload(authToken)
        return id
    }
    throw new Error('Вы не аутентифицированы')
}

//get context type
function getType(req, authToken) {
    if (req) {
        const authHeader = req.headers.authorization
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            if (!token) {
                throw new Error('Токен не найден')
            }
            const { type } = getTokenPayload(token)
            return type
        }
    } else if (authToken) {
        const { type } = getTokenPayload(authToken)
        return type
    }
    throw new Error('Вы не аутентифицированы')
}

module.exports = {
    APP_SECRET,
    IMAGE_SECRET,
    getPhone,
    getId,
    getType,
}
