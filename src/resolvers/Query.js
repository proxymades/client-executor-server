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
        }
    })
    if (phone === args.phone) {
        return client
    } else return null
}

module.exports = {
    checkClientPhone,
    clientProfile,
}

