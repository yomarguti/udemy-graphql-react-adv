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
    stock: Int
    price: Float
    createdAt: String
  }

  type Client {
    id: ID
    name: String
    lastname: String
    email: String
    company: String
    phone: String
    createdAt: String
    sellerId: ID
  }

  type Order {
    id: ID
    products: [OrderProducts]
    total: Float
    client: ID
    seller: ID
    createdAt: String
    status: OrderStatus
  }

  type OrderProducts {
    id: ID
    quantity: Int
  }

  type TopClients {
    total: Float
    client: [Client]
  }
  type TopSellers {
    total: Float
    seller: [User]
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
    stock: Int!
    price: Float!
  }

  input ClientInput {
    name: String!
    lastname: String!
    email: String!
    company: String!
    phone: String
  }

  enum OrderStatus {
    PENDING
    COMPLETED
    CANCELED
  }

  input OrderProductsInput {
    id: ID
    quantity: Int
  }

  input OrderInput {
    products: [OrderProductsInput]
    total: Float!
    client: ID!
    status: OrderStatus
  }

  type Query {
    #Users
    getUser: User

    #Products
    getProducts: [Product]
    getProduct(id: ID!): Product

    #Clients
    getClients: [Client]
    getClientsBySeller: [Client]
    getClient(id: ID): Client

    #Orders
    getOrders: [Order]
    getOrdersBySeller: [Order]
    getOrder(id: ID): Order
    getOrdersByStatus(status: OrderStatus): [Order]

    #Advanced Searchs
    getBestClients: [TopClients]
    getBestSellers: [TopSellers]
    findProduct(text: String!): [Product]
  }

  type Mutation {
    #Users
    newUser(input: UserInput!): User
    authUser(input: AuthInput!): Token

    #Products
    newProduct(input: ProductInput): Product
    updateProduct(id: ID, input: ProductInput): Product
    deleteProduct(id: ID): String

    #Clients
    newClient(input: ClientInput): Client
    updateClient(id: ID, input: ClientInput): Client
    deleteClient(id: ID): String

    #Pedidos
    newOrder(input: OrderInput): Order
    updateOrder(id: ID, input: OrderInput): Order
    deleteOrder(id: ID): String
  }
`;

module.exports = typeDefs;
