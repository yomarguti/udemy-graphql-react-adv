const User = require("../models/user");
const Product = require("../models/products");
const Client = require("../models/clients");
const { getToken, verifyToken } = require("../lib/auth");

const bcryptjs = require("bcryptjs");
const { UserInputError } = require("apollo-server-errors");

//Resolvers
const resolvers = {
  Query: {
    getUser: (_, { token }, ctx, info) => {
      try {
        const user = verifyToken(token);
        if (!user) throw new Error("Error de authenticacion");
        return user;
      } catch (error) {
        console.log(error);
      }
    },
    getProducts: async () => {
      try {
        const products = await Product.find();
        return products;
      } catch (error) {
        console.log(error);
      }
    },
    getProduct: async (_, { id }) => {
      const product = await Product.findById(id);
      if (!product) throw new UserInputError("Producto no encontrado");
      return product;
    },
    getClients: async () => {
      try {
        const clients = await Client.find();
        if (!clients) throw new Error("Clientes no encontrados");
        return clients;
      } catch (error) {
        console.log(error);
      }
    },
    getClientsBySeller: async (_, {}, { user, userModel }) => {
      await userModel.populate({ path: "clients" });
      console.log(userModel);
      try {
        const client = await Client.find({ sellerId: user.id });
        if (!client) throw new Error("Clientes no encontrados");
        return client;
      } catch (error) {
        console.log(error);
      }
    },
    getClient: async (_, { id }, { user }) => {
      try {
        if (!user) throw new Error("Usuario no authenticado");
        const client = await Client.find({ _id: id, sellerId: user.id });
        if (client.length === 0) throw new Error("Cliente no encontrado");
        return client[0];
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
        const token = getToken({ name, lastname, id });
        return { token };
      } catch (error) {
        console.log(error);
      }
    },
    newProduct: async (_, { input }) => {
      try {
        const product = await Product.create(input);
        return product;
      } catch (error) {
        console.log(error);
      }
    },
    updateProduct: async (_, { id, input }) => {
      const product = await Product.findByIdAndUpdate(id, input, {
        returnDocument: "after",
      });
      if (!product) throw new Error("Producto no encontrado");
      return product;
    },
    deleteProduct: async (_, { id }) => {
      const product = await Product.findByIdAndRemove(id);
      if (!product) throw new Error("Producto no eliminado");
      return "Producto eliminado correctamente";
    },
    newClient: async (_, { input }, { user }, info) => {
      try {
        const client = await Client.create({
          ...input,
          sellerId: user.id,
        });
        return client;
      } catch (error) {
        console.log(error);
        throw new Error("Cliente no registrado");
      }
    },
    updateClient: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Usuario no authenticado");
      const client = await Client.findOneAndUpdate(
        { _id: id, sellerId: user.id },
        input,
        { returnDocument: "after" }
      );

      if (!client) throw new Error("Cliente no actualizado");
      return client;
    },
    deleteClient: async (_, { id }, { user }) => {
      if (!user) throw new Error("Usuario no authenticado");
      const client = await Client.findOneAndRemove({
        _id: id,
        sellerId: user.id,
      });
      if (!client) throw new Error("Cliente no eliminado");
      return "Cliente eliminado correctamente";
    },
  },
};

module.exports = resolvers;
