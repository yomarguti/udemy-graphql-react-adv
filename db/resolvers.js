const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    getUser: (_, { token }, ctx, info) => {
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        console.log(user);
        return user;
      } catch (error) {
        console.log(error);
      }
    },
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
    authUser: async (_, { input: { email, password } }, ctx, info) => {
      try {
        const user = await User.findOne({ email });
        if (!user) throw new Error("Usuario no existe");

        const isValid = await bcryptjs.compare(password, user.password);
        if (!isValid) throw new Error("Password incorrecto");

        const { name, lastname, id } = user;
        const token = jwt.sign(
          { id, name, lastname, email },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );
        return { token };
      } catch (error) {
        console.log(error);
      }
    },
  },
};

module.exports = resolvers;
