const { ApolloServer } = require('apollo-server')
const { PrismaClient } = require('@prisma/client')

const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const { typeDefs } = require('./typeDefs/schema')

const { getUserPhone, getUserId } = require('./utils')

const prisma = new PrismaClient()

const resolvers = {
    Query,
    Mutation
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    context: ({ req }) => {
        return {
            ...req,
            prisma,
            phone:
                req && req.headers.authorization
                    ? getUserPhone(req)
                    : null
            ,
            id:
                req && req.headers.authorization
                    ? getUserId(req)
                    : null
        }

    }
})

server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
})