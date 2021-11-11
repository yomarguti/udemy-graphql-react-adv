const { ApolloServer, gql } = require("apollo-server");
const { verifyToken } = require("./lib/auth");

const User = require("./models/user");

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
      const user = verifyToken(token);
      if (!user) return null;
      const userModel = await User.findById(user.id);
      return { user, userModel };
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server running on the url ${url}`);
});
