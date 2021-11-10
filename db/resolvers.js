const User = require("../models/user");
const bcryptjs = require("bcryptjs");

const cursos = [
  {
    titulo: "Curso profesional de Javascript",
    tecnologia: "Javascript",
  },
  {
    titulo: "Curso practico de react",
    tecnologia: "React",
  },
  {
    titulo: "Curso Express",
    tecnologia: "Nodejs",
  },
];

//Resolvers
const resolvers = {
  Query: {
    obtenerCurso: (_, { input }, ctx, info) => {
      console.log("Context: ", ctx);
      return cursos.find((curso) => curso.tecnologia === input.tecnologia);
    },
    obtenerCursos: () => cursos,
    obtenerTecnologias: () => cursos,
  },
  Mutation: {
    newUser: async (_, { input }, ctx, info) => {
      try {
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(input.password, salt);
        const user = await User.create({ ...input, password: hashedPassword });
        return user;
      } catch (error) {
        console.log(error);
      }
    },
  },
};

module.exports = resolvers;
