const bcrypt = require('bcryptjs')

//check password
async function checkPassword(parent, args, context) {
    const { username } = context
    const findedUser = await context.prisma.user.findUnique({
        where: {
            username: username
        }
    })
    const valid = await bcrypt.compare(args.password, findedUser.password)
    if (valid) {
        return true
    } else return false
}

//check username
async function checkUsername(parent, args, context) {
    const findedUser = await context.prisma.user.findUnique({
        where: {
            username: args.username
        }
    })
    if (findedUser !== null ||
        args.username === 'direct' ||
        args.username === 'directs' ||
        args.username === 'instagram' ||
        args.username === 'insta' ||
        args.username === 'twitter' ||
        args.username === 'facebook' ||
        args.username === 'gov' ||
        args.username === 'egov' ||
        args.username === 'link' ||
        args.username === 'linkedin' ||
        args.username === 'undefined' ||
        args.username === 'sex' ||
        args.username === 'sexy' ||
        args.username === 'father' ||
        args.username === 'mother' ||
        args.username === 'child' ||
        args.username === 'children' ||
        args.username === 'clex' ||
        args.username === 'clexx' ||
        args.username === 'guest' ||
        args.username === 'guests' ||
        args.username === 'search' ||
        args.username === 'create' ||
        args.username === 'creator' ||
        args.username === 'activity' ||
        args.username === 'drafts' ||
        args.username === 'draft' ||
        args.username === 'profileupdate' ||
        args.username === 'update' ||
        args.username === 'updates' ||
        args.username === 'profile' ||
        args.username === 'bookmarks' ||
        args.username === 'bookmark' ||
        args.username === 'tag' ||
        args.username === 'tags' ||
        args.username === 'trash' ||
        args.username === 'empty' ||
        args.username === 'location' ||
        args.username === 'locations' ||
        args.username === 'settings' ||
        args.username === 'setting' ||
        args.username === 'god' ||
        args.username === 'gods' ||
        args.username === 'password' ||
        args.username === 'passwords'
    ) {
        return true
    } else return false
}

//check regPhone
async function checkRegPhone(parent, args, context) {
    const findedPhone = await context.prisma.user.findUnique({
        where: {
            regPhone: args.regPhone
        }
    })
    if (findedPhone !== null) {
        return true
    } else return false
}


module.exports = {

    checkPassword,
    checkUsername,
    checkRegPhone,

}

