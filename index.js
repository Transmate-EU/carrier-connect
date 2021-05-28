import server from "./server";
import dotenv from 'dotenv';

dotenv.config()

server.listen({ port: 4000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
