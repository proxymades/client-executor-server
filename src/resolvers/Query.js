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


module.exports = {
    checkClientPhone,
}

