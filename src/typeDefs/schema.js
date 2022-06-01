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
        order: [Order!]
    }

    type Executor {
        id: ID!
        phone: String!
        name: String!
        avatar: String
        verified: Boolean!
        createdAt: DateTime!
    }

    type Order {
        id: ID!
        header: String!
        category: String!
        count: String!
        text:  String!
        city:  String!
        urgent: Boolean!
        image: String
        createdAt: DateTime!
        client: Client!
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
        clientNewOrders(phone: String!): [Order!]
        order(id: ID!): Order!
    }

    #Mutation
    type Mutation{

        #client
        uploadClientAvatar(
            file: Upload!
        ): Void

        uploadOrderImage(
            file: Upload!
            orderId: String!
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

        createOrder(
            id: ID!
            header: String!
            category: String!
            count: String!
            text:  String!
            city:  String!
            urgent: Boolean!
            image: String
        ): Order!

        deleteOrder(
            id: ID!
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