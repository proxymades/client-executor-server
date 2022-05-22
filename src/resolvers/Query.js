const bcrypt = require('bcryptjs')

//check password
async function checkPassword(parent, args, context) {
    const { phone } = context
    const findedUser = await context.prisma.user.findUnique({
        where: {
            phone: phone
        }
    })
    const valid = await bcrypt.compare(args.password, findedUser.password)
    if (valid) {
        return true
    } else return false
}

//check phone
async function checkPhone(parent, args, context) {
    const findedPhone = await context.prisma.user.findUnique({
        where: {
            phone: args.phone
        }
    })
    if (findedPhone !== null) {
        return true
    } else return false
}


module.exports = {
    checkPassword,
    checkPhone,
}

