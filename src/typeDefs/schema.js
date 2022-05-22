const { gql } = require('apollo-server')

const typeDefs = gql`
    #Types
    type Client {
        id: ID!
        phone: String!
        name: String!
        avatar: String
        verified: Boolean!
        createdAt: DateTime!
    }

    type Executor {
        id: ID!
        phone: String!
        name: String!
        avatar: String
        verified: Boolean!
        createdAt: DateTime!
    }

    #Auth
    type ClientAuthPayload {
        token: String
        client: Client
    }

    type ExecutorAuthPayload {
        token: String
        executor: Executor
    }  

    #Query
    type Query{

        #app queries
        clientCheckPassword(password: String!): Boolean!
        clientCheckPhone(phone: String!): Boolean!

    }

    #Mutation
    type Mutation{

        clientSignup(     
            id: ID!
            phone: String!
            password: String!
            name: String!
            type: String!
        ): ClientAuthPayload

        clientLogin(
            phone: String! 
            password: String!
            type: String!
        ): ClientAuthPayload

    }

    scalar DateTime
    scalar Date
    scalar Void
`

module.exports = {
    typeDefs
}