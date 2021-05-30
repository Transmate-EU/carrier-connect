import fs from 'fs';
import path from 'path';
import resolvers from './resolvers/resolvers';
import { ApolloServer } from 'apollo-server';
import { setEnv } from './functions/setEnv';

const server = new ApolloServer({
    typeDefs: fs.readFileSync(
        path.join(__dirname, './schemas/shipmentV2.gql') ,
        'utf8'
    ),
    playground: {
        endpoint: "/graphql",
    },
    resolvers,
    context: ({ req }) => {
        const env = {
            NODE_ENV: req.headers["node_env"],
            POSTMEN_SANDBOX_URL: req.headers["postmen_sandbox_url"],
            POSTMENT_TEST_API_KEY: req.headers["postmen_test_api_key"],
            SHIPPO_TEST_API_KEY: req.headers["shippo_test_api_key"],
            POSTMEN_PROD_URL: req.headers["postmen_prod_url"],
            POSTMENT_PROD_API_KEY: req.headers["postmen_prod_api_key"],
            SHIPPO_URL: req.headers["shippo_url"],
            SHIPPO_PROD_API_KEY: req.headers["shippo_prod__api_key"],
            AFTER_SHIP_TEST_API_KEY: req.headers["after_ship_test_api_key"],
            AFTER_SHIP_PROD_API_KEY: req.headers["after_ship_prod_api_key"],
            AFTER_SHIP_URL: req.headers["after_ship_url"],
            SHIPPO_TEST_SHIPPER_ACCOUNT: req.headers["shippo_test_shipper_account"]
        }
        setEnv(env);
        return env;
    }
});

export default server;