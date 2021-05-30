import typeDefs from "../schemas/shipmentV2.gql";
import resolvers from "../resolvers/resolvers";

const debug = require("debug")("graphql:endpoint");

const { makeExecutableSchema } = require("@graphql-tools/schema");

const { graphql } = require("graphql");

async function gqlResolve(args) {
  const schemaWithResolvers = makeExecutableSchema({
    typeDefs,
    resolvers
  });
  // const schemaWithResolvers = addResolversToSchema({ schema, resolvers });

  debug("schema %o", schemaWithResolvers);
  // The resolver for this action
  debug("get graphql args %o", args);
  return graphql(
    schemaWithResolvers,
    args.query,
    {},
    args.context,
    args.variables,
    args.operationName
  )
    .then(response => {
      debug("graphql response %o", response);
      return response;
    })
    .catch(error => {
      console.error(error);
    });
}

global.main = gqlResolve;

exports.gqlResolve = gqlResolve;
