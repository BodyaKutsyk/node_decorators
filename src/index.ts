import server from "src/dispatcher";

server.listen(Number(process.env.API_INTERNAL_PORT));
