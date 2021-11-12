const { ApolloServer, gql } = require("apollo-server");
const { getUser } = require("./lib/auth");

const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");

const connectDB = require("./config/db");
connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers["authorization"] || "";
    if (token) {
      const user = await getUser(token);
      return { user };
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server running on the url ${url}`);
});
