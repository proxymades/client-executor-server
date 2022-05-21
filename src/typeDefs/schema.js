const { gql } = require('apollo-server')

const typeDefs = gql`
    #Types
    type User {
        id: ID!
        username: String!
        regPhone: String!
        fullName: String!
        avatar: String
        status: Boolean!
        regDate: DateTime!
    }

    #Auth
    type AuthPayload {
        token: String
        user: User
    }  

    #Query
    type Query{

        #app queries
        checkUsername(username: String!): Boolean!
        checkPassword(password: String!): Boolean!
        checkRegPhone(regPhone: String!): Boolean!

    }

    #Mutation
    type Mutation{

        signup(     
            id: ID!
            username: String!
            password: String!
            regPhone: String!
            fullName: String!
        ): AuthPayload

        login(
            username: String! 
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