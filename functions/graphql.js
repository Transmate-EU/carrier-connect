'use strict';

import resolvers from '../resolvers/resolvers';
const debug = require("debug")("graphql:endpoint");
const { loadSchema } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { graphql } = require('graphql');


async function resolve(args) {
  const schema = await loadSchema('./schemas/shipmentV2.gql', {  // load from a single schema file
    loaders: [
      new GraphQLFileLoader()
    ]
  });
  const rootValue= {...resolvers.Query,...resolvers.Mutation};
  debug("schema %o", schema);
  // The resolver for this action
  debug("get graphql args %o", args)
  return graphql(schema, args.query, rootValue, args.context, args.variables, args.operationName).then((response) => {
    debug("graphql response %o", response);
    return response;
  }).catch(error => {
    console.error(error);
  });
}


resolve({ query: '{shipments(type:postmen){id}}' }).then(r => debug("result %j", r))
module.exports.main = resolve;