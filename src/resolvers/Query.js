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

//client new orders
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


//client order requests
async function clientOrderRequests(parent, args, context) {
    const { phone } = context
    return await context.prisma.orderRequest.findMany({
        where: {
            order: {
                creator: phone,
                isWork: false,
                isReady: false,
            }
        },
        include: {
            order: true,
            executor: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    phone: true,
                    verified: true,
                    createdAt: true,
                    orderRequest: {
                        select: {
                            id: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

//-----------order------------

//get client order
async function getClientOrder(parent, args, context) {
    return await context.prisma.order.findUnique({
        where: {
            id: args.id
        }
    })
}

//get executor order
async function getExecutorOrder(parent, args, context) {
    const { phone } = context
    return await context.prisma.order.findUnique({
        where: {
            id: args.id
        },
        include: {
            client: {
                select: {
                    name: true,
                    verified: true,
                    createdAt: true,
                    order: {
                        select: {
                            id: true,
                        }
                    }
                }
            },
            orderRequest: {
                where: {
                    worker: phone
                }
            }
        }
    })
}

//----------- executor ------------

//check executor phone
async function checkExecutorPhone(parent, args, context) {
    const findedPhone = await context.prisma.executor.findUnique({
        where: {
            phone: args.phone
        }
    })
    if (findedPhone !== null) {
        return true
    } else return false
}

//executor profile
async function executorProfile(parent, args, context) {
    const { phone } = context
    const executor = await context.prisma.executor.findUnique({
        where: {
            phone: args.phone
        },
        include: {
            orderRequest: true
        }
    })
    if (phone === args.phone) {
        return executor
    } else return null
}

//executor new orders
async function executorFeed(parent, args, context) {
    const { phone } = context
    return await context.prisma.order.findMany({
        where: {
            city: {
                in: args.city
            },
            category: {
                in: args.category
            },
            isWork: false,
            isReady: false,
            orderRequest: {
                none: {
                    worker: phone
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

//executor new orders requests
async function executorOrderRequests(parent, args, context) {
    const { phone } = context
    if (phone === args.phone) {
        return await context.prisma.orderRequest.findMany({
            where: {
                worker: phone
            },
            include: {
                order: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }
}

module.exports = {
    checkClientPhone,
    clientProfile,
    clientNewOrders,
    clientOrderRequests,

    getClientOrder,
    getExecutorOrder,

    checkExecutorPhone,
    executorProfile,
    executorFeed,
    executorOrderRequests,
}

