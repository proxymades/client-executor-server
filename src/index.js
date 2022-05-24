const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { GraphQLUpload, graphqlUploadExpress } = require('graphql-upload');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const { createServer } = require('http');
const { PrismaClient } = require('@prisma/client');

const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const { typeDefs } = require('./typeDefs/schema');

const { getPhone, getId, getType } = require('./utils');

const prisma = new PrismaClient();

const resolvers = {
    Upload: GraphQLUpload,
    Query,
    Mutation
};

(async function () {

    const app = express();

    const httpServer = createServer(app);

    const schema = makeExecutableSchema({
        typeDefs: typeDefs,
        resolvers,
        csrfPrevention: true,
    });

    const server = new ApolloServer({
        schema,
        uploads: false,
        context: ({ req }) => {
            return {
                ...req,
                prisma,
                phone:
                    req && req.headers.authorization
                        ? getPhone(req)
                        : null
                ,
                id:
                    req && req.headers.authorization
                        ? getId(req)
                        : null
                ,
                type:
                    req && req.headers.authorization
                        ? getType(req)
                        : null
                ,
            }

        }
    })

    await server.start()
    app.use(graphqlUploadExpress())
    server.applyMiddleware({ app })

    const PORT = 4000
    httpServer.listen(PORT, () =>
        console.log(`Server is now running on http://localhost:${PORT}/graphql`)
    )
})();