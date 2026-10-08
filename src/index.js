const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const { GraphQLUpload, graphqlUploadExpress } = require('graphql-upload')
const { createServer } = require('node:http')
const { PrismaClient } = require('@prisma/client')
const config = require('./config')
const { getAuth } = require('./utils')
const { initializeNotifications } = require('./notifications')
const { maxFileSize } = require('./uploads')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const { typeDefs } = require('./typeDefs/schema')

async function start() {
    if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL in .env')
    initializeNotifications()
    const prisma = new PrismaClient()
    const app = express()
    app.disable('x-powered-by')
    const httpServer = createServer(app)
    const server = new ApolloServer({
        typeDefs,
        resolvers: { Upload: GraphQLUpload, Query, Mutation },
        csrfPrevention: true,
        context: ({ req }) => ({ prisma, ...getAuth(req) }),
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        formatError(error) {
            if (error.extensions.code === 'INTERNAL_SERVER_ERROR') {
                return { message: 'Ошибка сервера. Попробуйте позже', extensions: { code: 'INTERNAL_SERVER_ERROR' } }
            }
            return { message: error.message, extensions: { code: error.extensions.code } }
        },
    })
    await server.start()
    app.use(graphqlUploadExpress({ maxFileSize, maxFiles: 1 }))
    server.applyMiddleware({ app, cors: { origin: config.corsOrigins } })
    try {
        await new Promise((resolve, reject) => {
            httpServer.once('error', reject)
            httpServer.listen(config.port, () => {
                httpServer.removeListener('error', reject)
                resolve()
            })
        })
    } catch (error) {
        await server.stop()
        await prisma.$disconnect()
        throw error
    }
    console.log(`GraphQL: http://localhost:${httpServer.address().port}${server.graphqlPath}`)
    let stopping = false
    async function shutdown() {
        if (stopping) return
        stopping = true
        await server.stop()
        await prisma.$disconnect()
    }
    process.once('SIGTERM', shutdown)
    process.once('SIGINT', shutdown)
    return { server, httpServer, prisma, shutdown }
}

if (require.main === module) start().catch(error => {
    // Startup errors may contain credential paths; never log database URLs.
    console.error('Server startup failed. Check .env and Firebase configuration.')
    process.exitCode = 1
})
module.exports = { start }
