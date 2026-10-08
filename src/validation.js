const { UserInputError } = require('apollo-server-express')
const { identifier } = require('./access')

function text(value, label, max, required = true) {
    if (typeof value !== 'string') throw new UserInputError(`Некорректное поле: ${label}`)
    const clean = value.trim()
    if ((required && !clean) || clean.length > max) throw new UserInputError(`Некорректное поле: ${label}`)
    return clean
}

function phone(value) {
    const clean = text(value, 'телефон', 20)
    if (!/^[0-9]{10,20}$/.test(clean)) throw new UserInputError('Некорректный телефон')
    return clean
}

function password(value, signup = false) {
    if (typeof value !== 'string' || !value.length || Buffer.byteLength(value, 'utf8') > 72 || (signup && value.length < 7)) {
        throw new UserInputError('Пароль должен содержать от 7 символов и не более 72 байт')
    }
    return value
}

function money(value) {
    const clean = text(value, 'цена', 10)
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(clean)) throw new UserInputError('Некорректная цена')
    return clean
}

const cities = ['nursultan', 'karaganda', 'almaty', 'atyrau']
const categories = ['polygraphy', 'souvenir', 'outad']
function choices(values, allowed) {
    if (values == null) return [...allowed]
    if (!Array.isArray(values) || values.length > allowed.length || values.some(v => !allowed.includes(v))) {
        throw new UserInputError('Некорректный фильтр')
    }
    return [...new Set(values)]
}

function orderInput(args) {
    identifier(args.id)
    const count = text(args.count, 'количество', 10)
    if (!/^\d+$/.test(count) || Number(count) < 1) throw new UserInputError('Некорректное количество')
    if (!cities.includes(args.city) || !categories.includes(args.category) || typeof args.urgent !== 'boolean') {
        throw new UserInputError('Некорректные параметры заказа')
    }
    return {
        header: text(args.header, 'заголовок', 30).replace(/\s+/g, ' '),
        count, category: args.category, text: text(args.text, 'описание', 200),
        city: args.city, urgent: args.urgent,
    }
}

function feedbackInput(args) {
    identifier(args.id)
    if (!Number.isInteger(args.rating) || args.rating < 1 || args.rating > 5) throw new UserInputError('Оценка должна быть от 1 до 5')
    return { id: args.id, rating: args.rating, message: text(args.message || '', 'отзыв', 200, false) }
}

module.exports = { text, phone, password, money, choices, cities, categories, orderInput, feedbackInput }
