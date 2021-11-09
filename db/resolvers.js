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
};

module.exports = resolvers;
