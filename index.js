const { ApolloServer } = require("apollo-server");

const mongoose = require("mongoose");
const { mongodb } = require("./config.js");

const typeDefs = require("./graphql/typeDefs");

const resolvers = require("./graphql/resolvers");

const PORT = process.env.PORT || 5000;
mongoose
  .connect(mongodb, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    console.log("mongo db connected");
  })
  .catch((err) => {
    console.error(err);
  });
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});
server
  .listen({ port: PORT })
  .then((res) => console.log(`server started ${res.url}`));
