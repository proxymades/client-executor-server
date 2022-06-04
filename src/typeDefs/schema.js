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
        orderRequest: [OrderRequest!]
    }

    type Order {
        id: ID!
        creator: String!
        header: String!
        category: String!
        count: String!
        text:  String!
        city:  String!
        urgent: Boolean!
        image: String
        isReady: Boolean!
        isWork: Boolean!
        createdAt: DateTime!
        client: Client!
        orderRequest: [OrderRequest!]
}

    type OrderRequest {
        id: ID!
        orderId: String!
        worker: String!
        offer: String!
        createdAt: DateTime!
        order: Order!
        executor: Executor!
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
        clientOrderRequests: [OrderRequest!]

        #order
        getClientOrder(id: ID!): Order!
        getExecutorOrder(id: ID!): Order!
        
        #executor queries
        checkExecutorPhone(phone: String!): Boolean!
        executorProfile(phone: String!): Executor
        executorFeed(city: [String!], category: [String!]): [Order!]
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

        createOrderRequest(
            id: ID!
            orderId: String!
            offer: String!
        ): String!

        cancelOrderRequest(
            orderId: ID!
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