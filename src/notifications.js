const fs = require('node:fs')
const path = require('node:path')
const config = require('./config')
let admin

function initializeNotifications() {
    if (!config.firebaseEnabled || admin) return
    admin = require('firebase-admin')
    const credential = config.firebaseServiceAccount
        ? admin.credential.cert(JSON.parse(fs.readFileSync(path.resolve(config.root, config.firebaseServiceAccount), 'utf8')))
        : admin.credential.applicationDefault()
    if (!admin.apps.length) admin.initializeApp({ credential })
}

async function notify(prisma, role, phone, body, type) {
    if (!config.firebaseEnabled) return
    // A Firebase failure must never roll back a completed order operation.
    try {
        initializeNotifications()
        const model = role === 'client' ? prisma.clientNotificationToken : prisma.executorNotificationToken
        const rows = await model.findMany({ where: { phone }, select: { token: true } })
        const tokens = [...new Set(rows.map(row => row.token))]
        for (let i = 0; i < tokens.length; i += 500) {
            const batch = tokens.slice(i, i + 500)
            const result = await admin.messaging().sendMulticast({
                tokens: batch, notification: { title: 'clex', body },
                android: { notification: { icon: 'ic_notification', color: '#282C34', priority: 'high', channelId: 'activity' } },
                data: { type },
            })
            const expired = result.responses.flatMap((response, index) =>
                ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(response.error && response.error.code)
                    ? [batch[index]] : [])
            if (expired.length) await model.deleteMany({ where: { phone, token: { in: expired } } })
        }
    } catch {
        console.warn('Push notification delivery failed; the operation was saved')
    }
}

module.exports = { initializeNotifications, notify }
