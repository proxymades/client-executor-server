const bcrypt = require('bcryptjs')

//----------- client ------------

//check password
async function clientCheckPassword(parent, args, context) {
    const { phone } = context
    const finded = await context.prisma.client.findUnique({
        where: {
            phone: phone
        }
    })
    const valid = await bcrypt.compare(args.password, finded.password)
    if (valid) {
        return true
    } else return false
}

//check phone
async function clientCheckPhone(parent, args, context) {
    const findedPhone = await context.prisma.client.findUnique({
        where: {
            phone: args.phone
        }
    })
    if (findedPhone !== null) {
        return true
    } else return false
}


module.exports = {
    clientCheckPassword,
    clientCheckPhone,
}

