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
`;

module.exports = typeDefs;
