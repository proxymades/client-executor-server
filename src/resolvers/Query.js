const bcrypt = require('bcryptjs')

//----------- client ------------

//check phone
async function checkClientPhone(parent, args, context) {
    const findedPhone = await context.prisma.client.findUnique({
        where: {
            phone: args.phone
        }
    })
    if (findedPhone !== null) {
        return true
    } else return false
}

//client profile
async function clientProfile(parent, args, context) {
    const { phone } = context
    const client = await context.prisma.client.findUnique({
        where: {
            phone: args.phone
        },
        include: {
            order: {
                select: {
                    id: true
                }
            }
        }
    })
    if (phone === args.phone) {
        return client
    } else return null
}

//client orders
async function clientNewOrders(parent, args, context) {
    const { phone } = context
    const orders = await context.prisma.order.findMany({
        where: {
            creator: args.phone,
            isWork: false,
            isReady: false,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    if (phone === args.phone) {
        return orders
    } else return null
}

//client orders
async function order(parent, args, context) {
    return await context.prisma.order.findUnique({
        where: {
            id: args.id
        }
    })
}

module.exports = {
    checkClientPhone,
    clientProfile,
    clientNewOrders,
    order
}

