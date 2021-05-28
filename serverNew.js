const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { addResolversToSchema } =require ('@graphql-tools/schema');
const debug = require("debug")("graphql:server");
const { loadSchema } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { default: resolvers } = require('./resolvers/resolvers');


async function start() {
  debug("start server");

  const schema = await loadSchema('./schemas/shipmentV2.gql', {  // load from a single schema file
    loaders: [
      new GraphQLFileLoader()
    ]
  });
  const schemaWithResolvers = addResolversToSchema({ schema, resolvers });
  var app = express();
  app.use('/graphql', graphqlHTTP({
    schema: schemaWithResolvers,
    graphiql: true,
  }));
  app.listen(4001);
  

}



start();