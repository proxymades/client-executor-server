const { gql } = require('apollo-server')

const typeDefs = gql`
    #Types
    type User {
        id: ID!
        phone: String!
        fullName: String!
        avatar: String
        status: Boolean!
        createdAt: DateTime!
    }

    #Auth
    type AuthPayload {
        token: String
        user: User
    }  

    #Query
    type Query{

        #app queries
        checkPassword(password: String!): Boolean!
        checkPhone(phone: String!): Boolean!

    }

    #Mutation
    type Mutation{

        signup(     
            id: ID!
            phone: String!
            password: String!
            fullName: String!
        ): AuthPayload

        login(
            phone: String! 
            password: String!
        ): AuthPayload

    }

    scalar DateTime
    scalar Date
    scalar Void
`

module.exports = {
    typeDefs
}