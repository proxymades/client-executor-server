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
    return await context.prisma.client.findUnique({
        where: {
            phone: phone
        },
        include: {
            order: {
                select: {
                    id: true
                }
            },
            feedbackClient: true,
        }
    })
}

//client new orders
async function clientNewOrders(parent, args, context) {
    const { phone } = context
    return await context.prisma.order.findMany({
        where: {
            creator: phone,
            isWork: false,
            isReady: false,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

//client work orders
async function clientWorkOrders(parent, args, context) {
    const { phone } = context
    return await context.prisma.order.findMany({
        where: {
            creator: phone,
            isWork: true,
            isReady: false,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

//client ready orders
async function clientReadyOrders(parent, args, context) {
    const { phone } = context
    return await context.prisma.order.findMany({
        where: {
            creator: phone,
            isWork: false,
            isReady: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

//client orders requests
async function clientActivity(parent, args, context) {
    const { phone } = context
    return await context.prisma.orderRequest.findMany({
        where: {
            accepted: false,
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
                        where: {
                            finished: true
                        },
                        select: {
                            id: true
                        }
                    },
                    feedbackExecutor: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

//client order requests
async function clientOrderRequests(parent, args, context) {
    return await context.prisma.orderRequest.findMany({
        where: {
            order: {
                id: args.orderId,
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
                        where: {
                            finished: true
                        },
                        select: {
                            id: true
                        }
                    },
                    feedbackExecutor: true,
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
async function clientOrder(parent, args, context) {
    return await context.prisma.order.findUnique({
        where: {
            id: args.id
        }
    })
}

//get executor order
async function executorOrder(parent, args, context) {
    const { phone } = context
    return await context.prisma.order.findUnique({
        where: {
            id: args.id
        },
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                    verified: true,
                    createdAt: true,
                    order: {
                        select: {
                            id: true,
                        }
                    },
                    feedbackClient: true,
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
    return await context.prisma.executor.findUnique({
        where: {
            phone: phone
        },
        include: {
            orderRequest: {
                where: {
                    finished: true
                },
                select: {
                    id: true
                }
            },
            feedbackExecutor: true,
        }
    })
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
    return await context.prisma.orderRequest.findMany({
        where: {
            worker: phone,
            accepted: false,
        },
        include: {
            order: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

//executor work orders
async function executorWorkOrders(parent, args, context) {
    const { phone } = context
    return await context.prisma.orderRequest.findMany({
        where: {
            worker: phone,
            accepted: true,
            finished: false
        },
        include: {
            order: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

//executor ready orders
async function executorReadyOrders(parent, args, context) {
    const { phone } = context
    return await context.prisma.orderRequest.findMany({
        where: {
            worker: phone,
            accepted: true,
            finished: true
        },
        include: {
            order: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

//executor activity
async function executorActivity(parent, args, context) {
    const { phone } = context
    return await context.prisma.orderRequest.findMany({
        where: {
            worker: phone,
            accepted: true,
        },
        include: {
            order: {
                select: {
                    id: true,
                    header: true,
                    image: true,
                    client: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            phone: true,
                            verified: true,
                            createdAt: true,
                            order: {
                                select: {
                                    id: true
                                }
                            },
                            feedbackClient: true,
                        }
                    }
                }
            },
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

module.exports = {
    checkClientPhone,
    clientProfile,
    clientNewOrders,
    clientWorkOrders,
    clientReadyOrders,
    clientActivity,
    clientOrderRequests,
    clientOrder,
    executorOrder,
    checkExecutorPhone,
    executorProfile,
    executorFeed,
    executorOrderRequests,
    executorWorkOrders,
    executorReadyOrders,
    executorActivity,
}

