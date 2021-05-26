'use strict';

import resolvers from '../resolvers/resolvers';
const debug = require("debug")("graphql:endpoint");
const { loadSchema } = require('@graphql-tools/load');
const { addResolversToSchema } =require ('@graphql-tools/schema');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { graphql } = require('graphql');


async function gqlResolve(args) {
  const schema = await loadSchema('./schemas/shipmentV2.gql', {  // load from a single schema file
    loaders: [
      new GraphQLFileLoader()
    ]
  });
  const schemaWithResolvers = addResolversToSchema({ schema, resolvers });
  const rootValue= resolvers;// {...resolvers.Query,...resolvers.Mutation};
  debug("schema %o", schema);
  // The resolver for this action
  debug("get graphql args %o", args)
  return graphql(schemaWithResolvers, args.query, {}, args.context, args.variables, args.operationName).then((response) => {
    debug("graphql response %o", response);
    return response;
  }).catch(error => {
    console.error(error);
  });
}



exports.gqlResolve =gqlResolve;