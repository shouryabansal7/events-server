const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql").graphqlHTTP;
const port = process.env.PORT || 8000;
//express-graphql is a middleware function that takes the incoming requests and funnel the through graphql query parser and automatically
//forward them to the right resolvers, it will be our duty to set the resolver schema up
const { buildSchema } = require("graphql");
//buildSchema is a function that takes a string and that string should define ur schema.
//the advantage of this approach is that we can build our schema as a string so in a convenient written form
//and the heavy lifting of converting this to js object and so on is taken care by this graphql package
const mongoose = require("mongoose");
const graphQlSchema = require("./graphql/schema");
const graphqlResolvers = require("./graphql/resolvers/index");
const isAuth = require("./middleware/is-auth");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(isAuth);

//! means its non nullible, means we cannot have events that do not have id.
//password is nullible since a lot of times we will not be returning passwords.
app.use(
  "/graphql",
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,
  })
);
//events77
//2D63USUbOmKAWaR8

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@events-cluster.e3ikd.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
