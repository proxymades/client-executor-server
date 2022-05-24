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

        #client queries
        checkClientPhone(phone: String!): Boolean!
        clientProfile(phone: String!): Client

    }

    #Mutation
    type Mutation{

        #client
        uploadClientAvatar(
            file: Upload!
        ): Void

        deleteClientAvatar(
            phone: String!
        ): Void

        clientSignup(     
            id: ID!
            phone: String!
            password: String!
            name: String!
        ): ClientAuthPayload

        clientLogin(
            phone: String!
            password: String!
        ): ClientAuthPayload

        updateClientProfile(
            phone: String!
            name: String!
            avatar: String
        ): Void

    }

    scalar DateTime
    scalar Date
    scalar Void
    scalar Upload
`

module.exports = {
    typeDefs
}