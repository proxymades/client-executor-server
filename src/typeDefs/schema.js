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

    type OrderRequest {
        id: ID!
        orderId: String!
        worker: String!
        createdAt: DateTime!
        order: Order!
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

        #order
        getOrder(id: ID!): Order!
        
        #executor queries
        checkExecutorPhone(phone: String!): Boolean!
        executorProfile(phone: String!): Executor
        executorNewOrders(
            city: [String!]
            category: [String!]
        ): [Order!]
        executorOrderRequests(phone: String!): [OrderRequest!]
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

        deleteOrderImage(
            orderId: String!
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

        #executor
        uploadExecutorAvatar(
            file: Upload!
        ): Void

        deleteExecutorAvatar(
            phone: String!
        ): Void

        executorSignup(     
            id: ID!
            phone: String!
            password: String!
            name: String!
        ): ExecutorAuthPayload

        executorLogin(
            phone: String!
            password: String!
        ): ExecutorAuthPayload

        updateExecutorProfile(
            phone: String!
            name: String!
            avatar: String
        ): Void

        #order
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

        updateOrder(
            id: ID!
            header: String!
            category: String!
            count: String!
            text:  String!
            city:  String!
            urgent: Boolean!
            image: String
        ): Void

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