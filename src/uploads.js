const fs = require('node:fs')
const path = require('node:path')
const { randomUUID } = require('node:crypto')
const { Transform } = require('node:stream')
const { pipeline } = require('node:stream/promises')
const { UserInputError } = require('apollo-server-express')
const { assetsDir } = require('./config')
const { identifier } = require('./access')
const maxFileSize = 10 * 1024 * 1024

function imagePath(role, kind, id) {
    identifier(id)
    return path.join(assetsDir, 'images', role, kind, `${id}.jpg`)
}

async function saveImage(file, target) {
    const { createReadStream, filename, mimetype } = await file
    if (!/\.(jpe?g|png)$/i.test(filename) || !['image/jpeg', 'image/png'].includes(mimetype)) {
        throw new UserInputError('Вы можете загружать только JPEG и PNG')
    }
    let size = 0
    let prefix = Buffer.alloc(0)
    let checked = false
    const check = new Transform({
        transform(chunk, encoding, callback) {
            size += chunk.length
            if (size > maxFileSize) return callback(new UserInputError('Изображение превышает 10 МБ'))
            if (!checked) {
                prefix = Buffer.concat([prefix, chunk])
                if (prefix.length < 8) return callback()
                const jpeg = prefix[0] === 0xff && prefix[1] === 0xd8 && prefix[2] === 0xff
                const png = prefix.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
                if ((mimetype === 'image/jpeg' && !jpeg) || (mimetype === 'image/png' && !png)) {
                    return callback(new UserInputError('Некорректный файл изображения'))
                }
                checked = true
                this.push(prefix)
                prefix = null
            } else this.push(chunk)
            callback()
        },
        flush(callback) {
            callback(checked ? null : new UserInputError('Некорректный файл изображения'))
        },
    })
    await fs.promises.mkdir(path.dirname(target), { recursive: true })
    const temporary = `${target}.${randomUUID()}.tmp`
    try {
        await pipeline(createReadStream(), check, fs.createWriteStream(temporary, { flags: 'wx' }))
        await fs.promises.rename(temporary, target)
    } finally {
        await fs.promises.rm(temporary, { force: true })
    }
}

async function deleteImage(target) {
    await fs.promises.rm(target, { force: true })
}

module.exports = { maxFileSize, imagePath, saveImage, deleteImage }
