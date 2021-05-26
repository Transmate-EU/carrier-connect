import fs from 'fs';
import path from 'path';
import resolvers from './resolvers/resolvers';
import { ApolloServer } from 'apollo-server';



const server = new ApolloServer({
    typeDefs: fs.readFileSync(
        path.join(__dirname, './schemas/shipmentV2.gql') ,
        'utf8'
    ),
    playground: {
        endpoint: "/graphql",
    },
    resolvers
});

export default server;