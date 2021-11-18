const User = require("../models/user");
const Product = require("../models/products");
const Client = require("../models/clients");
const Order = require("../models/orders");
const { getToken, getUser } = require("../lib/auth");

const bcryptjs = require("bcryptjs");
const { UserInputError } = require("apollo-server-errors");

//Resolvers
const resolvers = {
  Query: {
    getUser: (_, {}, { user }, info) => {
      if (!user) throw new Error("Usuario no authenticado");
      return user;
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
    getClientsBySeller: async (_, {}, { user }) => {
      if (!user) throw new Error("Usuario no authenticado");
      try {
        await user.populate("clients");
        return user.clients;
      } catch (error) {
        console.log(error);
      }
    },
    getClient: async (_, { id }, { user }) => {
      if (!user) throw new Error("Usuario no authenticado");
      try {
        const client = await Client.find({ _id: id, sellerId: user._id });
        if (client.length === 0) throw new Error("Cliente no encontrado");
        return client[0];
      } catch (error) {
        console.log(error);
      }
    },
    getOrders: async () => {
      try {
        const orders = await Order.find();
        return orders;
      } catch (error) {
        console.log(error);
      }
    },
    getOrdersBySeller: async (_, {}, { user }) => {
      if (!user) throw new Error("Usuario no authenticado");
      try {
        await user.populate("orders");
        return user.orders;
      } catch (error) {
        console.log(error);
      }
    },
    getOrder: async (_, { id }, { user }) => {
      if (!user) throw new Error("Usuario no authenticado");
      try {
        const orders = await Order.find({ _id: id, seller: user._id });
        if (orders.length === 0) throw new Error("Pedido no encontrado");
        return orders[0];
      } catch (error) {
        console.log(error);
      }
    },
    getOrdersByStatus: async (_, { status }, { user }) => {
      if (!user) throw new Error("Usuario no authenticado");
      try {
        const orders = await Order.find({ status, seller: user._id });
        return orders;
      } catch (error) {
        console.log(error);
      }
    },
    getBestClients: async () => {
      const clients = await Order.aggregate([
        { $match: { status: "COMPLETED" } },
        {
          $group: {
            _id: "$client",
            total: { $sum: "$total" },
          },
        },
        {
          $lookup: {
            from: "clients",
            localField: "_id",
            foreignField: "_id",
            as: "client",
          },
        },
        {
          $sort: {
            total: -1,
          },
        },
      ]);
      return clients;
    },
    getBestSellers: async () => {
      const sellers = await Order.aggregate([
        { $match: { status: "COMPLETED" } },
        {
          $group: {
            _id: "$seller",
            total: { $sum: "$total" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "seller",
          },
        },
        {
          $limit: 3,
        },
        {
          $sort: {
            total: -1,
          },
        },
      ]);
      return sellers;
    },
    findProduct: async (_, { text }) => {
      const products = await Product.find({ $text: { $search: text } });
      return products;
    },
  },
  Mutation: {
    newUser: async (_, { input }, ctx, info) => {
      try {
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(input.password, salt);
        const user = await User.create({ ...input, password: hashedPassword });
        if (!user) throw new Error("Usuario ya existe");
        return user;
      } catch (error) {
        throw new Error("Usuario ya existe");
      }
    },
    authUser: async (_, { input: { email, password } }, ctx, info) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("Usuario no existe");

      const isValid = await bcryptjs.compare(password, user.password);
      if (!isValid) throw new Error("Password incorrecto");

      const { name, lastname, _id } = user;
      const token = getToken({ name, lastname, _id });
      return { token };
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
      if (!user) throw new Error("Usuario no authenticado");
      try {
        const client = await Client.create({
          ...input,
          sellerId: user._id,
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
        { _id: id, sellerId: user._id },
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
        sellerId: user._id,
      });
      if (!client) throw new Error("Cliente no eliminado");
      return "Cliente eliminado correctamente";
    },
    newOrder: async (_, { input }, { user }) => {
      if (!user) throw new Error("Usuario no authenticado");
      try {
        await user.populate({ path: "clients", match: { _id: input.client } });
        if (user.clients.length === 0)
          throw new Error("No tiene acceso al cliente");

        const { error, updatedStock } = await validateStock(input.products);
        if (error) throw new Error(error);

        const order = await Order.create({
          ...input,
          seller: user._id,
          client: user.clients[0]._id,
        });
        if (!order) throw new Error("Orden no fue creada");

        await Promise.all(
          updatedStock.map((product) => {
            return Product.findByIdAndUpdate(product.id, {
              stock: product.stock,
            });
          })
        );

        return order;
      } catch (error) {
        console.log(error);
      }
    },
    updateOrder: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Usuario no authenticado");

      const order = await Order.find({
        _id: id,
        seller: user._id,
        client: input.client,
      });
      if (!order) throw new Error("Orden no existe");

      const { error, updatedStock } = await validateStock(input.products);
      if (error) throw new Error(error);

      const updatedOrder = await Order.findByIdAndUpdate(id, input, {
        returnDocument: "after",
      });

      await Promise.all(
        updatedStock.map((product) => {
          return Product.findByIdAndUpdate(product.id, {
            stock: product.stock,
          });
        })
      );

      return updatedOrder;
    },
    deleteOrder: async (_, { id }, { user }) => {
      if (!user) throw new Error("Usuario no authenticado");

      const order = await Order.findOneAndRemove({ _id: id, seller: user._id });
      if (!order) throw new Error("Pedido no eliminado");
      return "Pedido eliminado correctamente";
    },
  },
};

const validateStock = async (order) => {
  const ids = order.map((product) => product.id);
  const stock = await Product.find({ _id: { $in: ids } });

  const updatedStock = [];

  const isOrderValid = (product) => {
    const found = order.find((orderProduct) => orderProduct.id == product._id);
    updatedStock.push({
      id: product._id,
      stock: product.stock - found.quantity,
    });
    return found.quantity > product.stock;
  };

  const errorMessage = stock
    .filter(isOrderValid)
    .map((product) => `El articulo ${product.name} excede el stock`)
    .join(", ");

  if (errorMessage === "") {
    return {
      error: null,
      updatedStock,
    };
  }

  return {
    error: errorMessage,
  };
};

module.exports = resolvers;
