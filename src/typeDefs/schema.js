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
        feedbackClient: [FeedbackClient!]
    }

    type Executor {
        id: ID!
        phone: String!
        name: String!
        avatar: String
        verified: Boolean!
        createdAt: DateTime!
        orderRequest: [OrderRequest!]
        feedbackExecutor: [FeedbackExecutor!]
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
        feedbackExecutor: [FeedbackExecutor!]
        feedbackClient: [FeedbackClient!]
    }

    type OrderRequest {
        id: ID!
        orderId: String!
        worker: String!
        offer: String!
        accepted: Boolean!
        finished: Boolean!
        createdAt: DateTime!
        order: Order!
        executor: Executor!
    }

    type FeedbackExecutor {
        id: ID!
        whoUser: String!
        toUser: String!
        rating: Int!
        message: String!
        createdAt: DateTime!
        orderId: String!
    }

    type FeedbackClient {
        id: ID!
        whoUser: String!
        toUser: String!
        rating: Int!
        message: String!
        createdAt: DateTime!
        orderId: String!
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
        clientProfile: Client
        clientNewOrders: [Order!]
        clientWorkOrders: [Order!]
        clientReadyOrders: [Order!]
        clientActivity: [OrderRequest!]
        clientOrderRequests(orderId: ID!): [OrderRequest!]

        #order
        clientOrder(id: ID!): Order!
        executorOrder(id: ID!): Order!
        
        #executor queries
        checkExecutorPhone(phone: String!): Boolean!
        executorProfile: Executor
        executorFeed(city: [String!], category: [String!]): [Order!]
        executorActivity: [OrderRequest!]
        executorOrderRequests: [OrderRequest!]
        executorWorkOrders: [OrderRequest!]
        executorReadyOrders: [OrderRequest!]
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

        acceptOrderRequest(
            requestId: ID!
            previousRequestId: String
            orderId: String!
        ): Void

        repulseOrderRequest(
            requestId: ID!
            orderId: String!
        ): Void

        acceptOrderWork(
            orderId: ID!
            requestId: String!
        ): Void

        repulseOrderWork(
            orderId: ID!
            requestId: String!
        ): Void

        writeFeedbackExecutor(
            id: ID!
            rating: Int!
            message: String
            toUser: String!
            orderId: String!
        ): Boolean!

        writeFeedbackClient(
            id: ID!
            rating: Int!
            message: String
            toUser: String!
            orderId: String!
        ): Boolean!

        registerClientNotificationToken(
            id: ID!
            phone: String!
            token: String!
        ): Void

        deleteClientNotificationToken(
            phone: String!
            token: String!
        ): Void

        registerExecutorNotificationToken(
            id: ID!
            phone: String!
            token: String!
        ): Void

        deleteExecutorNotificationToken(
            phone: String!
            token: String!
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