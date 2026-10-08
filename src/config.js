const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const envFile = path.join(root, '.env')
if (fs.existsSync(envFile)) process.loadEnvFile(envFile)

function port(name, fallback) {
    const value = Number(process.env[name] || fallback)
    if (!Number.isInteger(value) || value < 1 || value > 65535) {
        throw new Error(`${name} must be a port between 1 and 65535`)
    }
    return value
}

const firebaseEnabled = process.env.FIREBASE_ENABLED || 'false'
if (!['true', 'false'].includes(firebaseEnabled)) {
    throw new Error('FIREBASE_ENABLED must be true or false')
}

module.exports = {
    root,
    port: port('PORT', 4000),
    imagesPort: port('IMAGES_PORT', 5001),
    assetsDir: path.resolve(root, process.env.ASSETS_DIR || 'public'),
    appSecret: process.env.APP_SECRET,
    tokenTtl: '7d',
    firebaseEnabled: firebaseEnabled === 'true',
    firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:8081').split(',').map(s => s.trim()).filter(Boolean),
}
