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

  type Query {
    obtenerCurso(input: CursoInput!): Curso
    obtenerCursos: [Curso]
    obtenerTecnologias: [Tecnologia]
  }
  type User {
    id: ID
    name: String
    lastname: String
    email: String
    createdAt: String
  }

  input UserInput {
    name: String
    lastname: String
    email: String
    password: String
  }

  type Mutation {
    newUser(input: UserInput!): User
  }
`;

module.exports = typeDefs;
