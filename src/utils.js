//core
const jwt = require('jsonwebtoken')
const APP_SECRET = process.env.APP_SECRET
const IMAGE_SECRET = process.env.IMAGE_SECRET

//Получение и верификация токена
function getTokenPayload(token) {
    return jwt.verify(token, APP_SECRET)
}

//Получение phone пользователя в заголовках
function getUserPhone(req, authToken) {
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

//Получение ID пользователя в заголовках
function getUserId(req, authToken) {
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


module.exports = {
    APP_SECRET,
    IMAGE_SECRET,
    getUserPhone,
    getUserId
}
