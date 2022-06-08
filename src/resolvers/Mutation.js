//core
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const { finished } = require('stream/promises')
const admin = require('firebase-admin')

//utils
const { APP_SECRET, IMAGE_SECRET } = require('../utils')
const { IMAGES_URI } = require('../uri')
const serviceAccount = require('../../clex-493e2-firebase-adminsdk-nbbl0-9073f165ae.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

//notifications function
function notificationData(text) {
    const notification = {
        title: 'clex',
        body: text,
        // imageUrl: 'https://alreme.com/images/avatars/ckzf54kfl007kextsed8dtv3f.jpg'
    }
    return notification
}

function androidData() {
    const android = {
        notification: {
            icon: 'ic_notification',
            color: '#282C34',
            priority: 'high',
            channelId: 'activity',
        }
    }
    return android
}

// RESOLVERS

//NOTIFICATIONS ----------------------------------------------------------------------------------------
//register client notification token
async function registerClientNotificationToken(parent, args, context, info) {
    const tokens = await context.prisma.clientNotificationToken.findMany({
        where: {
            phone: args.phone
        }
    })
    const isNewToken = tokens.find(el => el.token === args.token)
    if (!isNewToken) {
        await context.prisma.clientNotificationToken.create({
            data: {
                id: args.id,
                phone: args.phone,
                token: args.token,
            },
        })
    }
}

//delete client notification token
async function deleteClientNotificationToken(parent, args, context, info) {
    await context.prisma.clientNotificationToken.deleteMany({
        where: {
            phone: args.phone,
            token: args.token,
        }
    })
}
//register executor notification token
async function registerExecutorNotificationToken(parent, args, context, info) {
    const tokens = await context.prisma.executorNotificationToken.findMany({
        where: {
            phone: args.phone
        }
    })
    const isNewToken = tokens.find(el => el.token === args.token)
    if (!isNewToken) {
        await context.prisma.executorNotificationToken.create({
            data: {
                id: args.id,
                phone: args.phone,
                token: args.token,
            },
        })
    }
}

//delete executor notification token
async function deleteExecutorNotificationToken(parent, args, context, info) {
    await context.prisma.executorNotificationToken.deleteMany({
        where: {
            phone: args.phone,
            token: args.token,
        }
    })
}

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

//upload order image
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

//delete client avatar
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

//delete order image
async function deleteOrderImage(parent, args, context, info) {
    const orderId = args.orderId
    const { phone } = context
    const pathName = path.join(
        __dirname,
        `${IMAGES_URI}/images/client/orders/${orderId}.jpg`
    )
    const order = await context.prisma.order.findUnique({
        where: {
            id: orderId
        }
    })
    if (order.creator === phone) {
        await context.prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                image: ''
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

// --------- executor ------------

//upload executor avatar
async function uploadExecutorAvatar(parent, { file }, context) {
    const { id } = context
    const { createReadStream, filename, encoding, mimetype } = await file
    const { ext } = path.parse(filename)
    const validType = /\.(jpe?g|png)$/i.test(ext)
    if (!validType) {
        return new Error("Вы можете загружать только картинки")
    }
    const pathName = path.join(
        __dirname,
        `${IMAGES_URI}/images/executor/avatars/${id}.jpg`
    )
    const stream = createReadStream()
    const out = fs.createWriteStream(pathName)
    stream.pipe(out)
    await finished(out)
}

//delete executor avatar
async function deleteExecutorAvatar(parent, args, context, info) {
    const { phone, id } = context
    const pathName = path.join(
        __dirname,
        `${IMAGES_URI}/images/executor/avatars/${id}.jpg`
    )
    if (phone === args.phone) {
        await context.prisma.executor.update({
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

//signup executor
async function executorSignup(parent, args, context, info) {
    const phone = args.phone
    const password = await bcrypt.hash(args.password, 12)
    const findedExecutor = await context.prisma.executor.findUnique({
        where: {
            phone: phone,
        }
    })
    if (findedExecutor) {
        throw new Error('Номер телефона уже используется')
    }
    const executor = await context.prisma.executor.create({
        data: {
            id: args.id,
            phone: phone,
            password: password,
            name: args.name.trim().replaceAll('\n', ' '),
        }
    })
    const token = jwt.sign({
        phone: executor.phone,
        type: 'executor',
        id: executor.id
    }, APP_SECRET)
    return { token }
}

//login executor
async function executorLogin(parent, args, context, info) {
    const findedExecutor = await context.prisma.executor.findUnique({
        where: {
            phone: args.phone
        }
    })
    if (!findedExecutor) {
        throw new Error('Пользователь не найден')
    }
    const valid = await bcrypt.compare(args.password, findedExecutor.password)
    if (!valid) {
        throw new Error('Неверный пароль')
    }
    const token = jwt.sign({
        phone: findedExecutor.phone,
        type: 'executor',
        id: findedExecutor.id
    }, APP_SECRET)
    return { token, findedExecutor }
}

//update executor profile
async function updateExecutorProfile(parent, args, context, info) {
    const { phone, id } = context
    const avatarImagePath = path.join(
        __dirname,
        `${IMAGES_URI}/images/executor/avatars/${id}.jpg`
    )
    const imageHash = await bcrypt.hash(IMAGE_SECRET, 8)
    const avatarImage = args.avatar ? `images/executor/avatars/${args.avatar}.jpg` : ''
    const avatar = args.avatar ? `${avatarImage.split('?')[0]}?sh=${imageHash}` : ''
    if (phone === args.phone) {
        await context.prisma.executor.update({
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

//-------- order -----------

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

//update order
async function updateOrder(parent, args, context, info) {
    const { phone } = context
    const imageHash = await bcrypt.hash(IMAGE_SECRET, 8)
    const imagePath = args.image ? `images/client/orders/${args.id}.jpg` : ''
    const image = args.image ? `${imagePath.split('?')[0]}?sh=${imageHash}` : ''
    const order = await context.prisma.order.findUnique({
        where: {
            id: args.id
        }
    })
    if (order.creator === phone) {
        await context.prisma.order.update({
            where: {
                id: args.id,
            },
            data: {
                header: args.header.trim().replaceAll('\n', ' '),
                category: args.category,
                count: args.count.trim().replaceAll('\n', ' '),
                text: args.text.trim(),
                city: args.city,
                urgent: args.urgent,
                image: image,
            }
        })
    }
}

//delete order
async function deleteOrder(parent, args, context, info) {
    const { phone } = context
    const imagePath = path.join(
        __dirname,
        `${IMAGES_URI}/images/client/orders/${args.id}.jpg`
    )
    const order = await context.prisma.order.findUnique({
        where: {
            id: args.id,
        }
    })
    if (order.creator === phone) {
        await context.prisma.order.delete({
            where: {
                id: args.id,
            }
        })
        fs.existsSync(imagePath) && fs.unlinkSync(imagePath)
    }
}

//create order request
async function createOrderRequest(parent, args, context, info) {
    const { phone } = context
    const existRequest = await context.prisma.orderRequest.findMany({
        where: {
            orderId: args.orderId,
            worker: phone,
        }
    })
    const orderIsWorked = await context.prisma.order.findMany({
        where: {
            id: args.orderId,
            OR: [
                { isWork: true },
                { isReady: true },
            ]
        }
    })
    const order = await context.prisma.order.findUnique({
        where: {
            id: args.orderId,
        }
    })
    const tokens = await context.prisma.clientNotificationToken.findMany({
        where: {
            phone: order.creator
        },
        select: {
            token: true
        }
    })
    if (existRequest.length === 0 && orderIsWorked.length === 0) {
        if (tokens.length > 0) {
            await admin.messaging().sendMulticast({
                tokens: tokens.map(el => el.token),
                notification: notificationData('Новая заявка к вашему заказу'),
                android: androidData(),
                data: {
                    type: 'request'
                }
            })
        }
        await context.prisma.orderRequest.create({
            data: {
                id: args.id,
                offer: args.offer.trim(),
                worker: phone,
                orderId: args.orderId
            }
        })
        return 'ok'
    } else if (existRequest.length === 0 && orderIsWorked.length > 0) {
        return 'worked'
    } else return 'exist'
}

//cancel order request
async function cancelOrderRequest(parent, args, context, info) {
    const { phone } = context
    const order = await context.prisma.order.findUnique({
        where: {
            id: args.orderId,
        }
    })
    const tokens = await context.prisma.clientNotificationToken.findMany({
        where: {
            phone: order.creator
        },
        select: {
            token: true
        }
    })
    if (tokens.length > 0) {
        await admin.messaging().sendMulticast({
            tokens: tokens.map(el => el.token),
            notification: notificationData('Исполнитель отменил заявку'),
            android: androidData(),
            data: {
                type: 'request'
            }
        })
    }
    await context.prisma.orderRequest.deleteMany({
        where: {
            orderId: args.orderId,
            worker: phone
        }
    })
}

//accept order request
async function acceptOrderRequest(parent, args, context, info) {
    const { phone } = context
    const order = await context.prisma.order.findUnique({
        where: {
            id: args.orderId
        }
    })
    const orderRequest = await context.prisma.orderRequest.findUnique({
        where: {
            id: args.requestId
        }
    })
    const tokens = await context.prisma.executorNotificationToken.findMany({
        where: {
            phone: orderRequest.worker
        },
        select: {
            token: true
        }
    })
    if (order.creator === phone) {
        if (orderRequest) {
            if (tokens.length > 0) {
                await admin.messaging().sendMulticast({
                    tokens: tokens.map(el => el.token),
                    notification: notificationData('Ваша заявка к заказу подтверждена'),
                    android: androidData(),
                    data: {
                        type: 'requestAccepting'
                    }
                })
            }
            await context.prisma.orderRequest.update({
                where: {
                    id: args.requestId,
                },
                data: {
                    accepted: true
                }
            })
            if (args.previousRequestId) {
                await context.prisma.orderRequest.update({
                    where: {
                        id: args.previousRequestId,
                    },
                    data: {
                        accepted: false
                    }
                })
            }
            await context.prisma.order.update({
                where: {
                    id: args.orderId
                },
                data: {
                    isWork: true
                }
            })
        }
    }
}

//repulse order request
async function repulseOrderRequest(parent, args, context, info) {
    const { phone } = context
    const order = await context.prisma.order.findUnique({
        where: {
            id: args.orderId
        }
    })
    const orderRequest = await context.prisma.orderRequest.findUnique({
        where: {
            id: args.requestId
        }
    })
    const tokens = await context.prisma.executorNotificationToken.findMany({
        where: {
            phone: orderRequest.worker
        },
        select: {
            token: true
        }
    })
    if (order.creator === phone) {
        if (orderRequest) {
            if (tokens.length > 0) {
                await admin.messaging().sendMulticast({
                    tokens: tokens.map(el => el.token),
                    notification: notificationData('Заказчик отменил выполнение работы'),
                    android: androidData(),
                    data: {
                        type: 'requestAccepting'
                    }
                })
            }
            await context.prisma.orderRequest.update({
                where: {
                    id: args.requestId,
                },
                data: {
                    accepted: false
                }
            })
            await context.prisma.order.update({
                where: {
                    id: args.orderId
                },
                data: {
                    isWork: false
                }
            })
        }
    }
}

//accept order work
async function acceptOrderWork(parent, args, context, info) {
    const { phone } = context
    const order = await context.prisma.order.findUnique({
        where: {
            id: args.orderId
        }
    })
    const orderRequest = await context.prisma.orderRequest.findUnique({
        where: {
            id: args.requestId
        }
    })
    const tokens = await context.prisma.executorNotificationToken.findMany({
        where: {
            phone: orderRequest.worker
        },
        select: {
            token: true
        }
    })
    if (order.creator === phone) {
        if (orderRequest) {
            if (tokens.length > 0) {
                await admin.messaging().sendMulticast({
                    tokens: tokens.map(el => el.token),
                    notification: notificationData('Поздравляем! Заказ выполнен.'),
                    android: androidData(),
                    data: {
                        type: 'requestAccepting'
                    }
                })
            }
            await context.prisma.orderRequest.update({
                where: {
                    id: args.requestId,
                },
                data: {
                    finished: true
                }
            })
            await context.prisma.order.update({
                where: {
                    id: args.orderId
                },
                data: {
                    isWork: false,
                    isReady: true
                }
            })
        }
    }
}

//repulse order work
async function repulseOrderWork(parent, args, context, info) {
    const { phone } = context
    const order = await context.prisma.order.findUnique({
        where: {
            id: args.orderId
        }
    })
    const orderRequest = await context.prisma.orderRequest.findUnique({
        where: {
            id: args.requestId
        }
    })
    const tokens = await context.prisma.executorNotificationToken.findMany({
        where: {
            phone: orderRequest.worker
        },
        select: {
            token: true
        }
    })
    if (order.creator === phone) {
        if (orderRequest) {
            if (tokens.length > 0) {
                await admin.messaging().sendMulticast({
                    tokens: tokens.map(el => el.token),
                    notification: notificationData('Работа отклонена, к сожалению вы не выполнили заказ'),
                    android: androidData(),
                    data: {
                        type: 'requestAccepting'
                    }
                })
            }
            await context.prisma.orderRequest.delete({
                where: {
                    id: args.requestId,
                }
            })
            await context.prisma.order.update({
                where: {
                    id: args.orderId
                },
                data: {
                    isWork: false,
                }
            })
        }
    }
}

//write feedback to executor
async function writeFeedbackExecutor(parent, args, context, info) {
    const { phone } = context
    const order = await context.prisma.order.findUnique({
        where: {
            id: args.orderId
        }
    })
    const feedback = await context.prisma.feedbackExecutor.findMany({
        where: {
            orderId: args.orderId,
            whoUser: phone,
        }
    })
    const tokens = await context.prisma.executorNotificationToken.findMany({
        where: {
            phone: args.toUser
        },
        select: {
            token: true
        }
    })
    if (order.creator === phone) {
        if (feedback.length === 0) {
            if (args.message !== '' && tokens.length > 0) {
                await admin.messaging().sendMulticast({
                    tokens: tokens.map(el => el.token),
                    notification: notificationData('Вам оставлен новый отзыв'),
                    android: androidData(),
                    data: {
                        type: 'feedbackExecutor'
                    }
                })
            }
            await context.prisma.feedbackExecutor.create({
                data: {
                    id: args.id,
                    rating: args.rating,
                    message: args.message || '',
                    whoUser: phone,
                    toUser: args.toUser,
                    orderId: args.orderId
                }
            })
            return true
        } else return false
    }
}

//write feedback to client
async function writeFeedbackClient(parent, args, context, info) {
    const { phone } = context
    const order = await context.prisma.order.findUnique({
        where: {
            id: args.orderId
        }
    })
    const feedback = await context.prisma.feedbackClient.findMany({
        where: {
            orderId: args.orderId,
            whoUser: phone,
        }
    })
    const tokens = await context.prisma.clientNotificationToken.findMany({
        where: {
            phone: args.toUser
        },
        select: {
            token: true
        }
    })
    if (order.creator === args.toUser) {
        if (feedback.length === 0) {
            if (args.message !== '' && tokens.length > 0) {
                await admin.messaging().sendMulticast({
                    tokens: tokens.map(el => el.token),
                    notification: notificationData('Вам оставлен новый отзыв'),
                    android: androidData(),
                    data: {
                        type: 'feedbackClient'
                    }
                })
            }
            await context.prisma.feedbackClient.create({
                data: {
                    id: args.id,
                    rating: args.rating,
                    message: args.message || '',
                    whoUser: phone,
                    toUser: args.toUser,
                    orderId: args.orderId
                }
            })
            return true
        } else return false
    }
}

module.exports = {
    registerClientNotificationToken,
    deleteClientNotificationToken,
    registerExecutorNotificationToken,
    deleteExecutorNotificationToken,

    uploadClientAvatar,
    deleteClientAvatar,

    clientSignup,
    clientLogin,
    updateClientProfile,

    uploadExecutorAvatar,
    deleteExecutorAvatar,

    executorSignup,
    executorLogin,
    updateExecutorProfile,

    uploadOrderImage,
    deleteOrderImage,

    createOrder,
    updateOrder,
    deleteOrder,

    createOrderRequest,
    cancelOrderRequest,
    acceptOrderRequest,
    repulseOrderRequest,
    acceptOrderWork,
    repulseOrderWork,
    writeFeedbackExecutor,
    writeFeedbackClient,
}