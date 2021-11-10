const { gql } = require("apollo-server");

const typeDefs = gql`
  type Curso {
    titulo: String
  }

  type Tecnologia {
    tecnologia: String
  }

  input CursoInput {
    tecnologia: String
  }

  type User {
    id: ID
    name: String
    lastname: String
    email: String
    createdAt: String
  }

  type Token {
    token: String
  }

  type Product {
    id: ID
    name: String
    quantity: Int
    price: Float
    createdAt: String
  }

  input UserInput {
    name: String!
    lastname: String!
    email: String!
    password: String!
  }

  input AuthInput {
    email: String!
    password: String!
  }

  input ProductInput {
    name: String!
    quantity: Int!
    price: Float!
  }

  type Query {
    #Users
    getUser(token: String!): User

    #Products
    getProducts: [Product]
    getProduct(id: ID!): Product
  }

  type Mutation {
    #Users
    newUser(input: UserInput!): User
    authUser(input: AuthInput!): Token

    #Products
    newProduct(input: ProductInput): Product
    updateProduct(id: ID, input: ProductInput): Product
    deleteProduct(id: ID): String
  }
`;

module.exports = typeDefs;
