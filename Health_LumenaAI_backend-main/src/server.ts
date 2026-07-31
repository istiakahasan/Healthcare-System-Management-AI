import { Server } from "http";
import app from "./app";
import config from "./config";
import { seedAdmin } from "./app/utils/seedAdmin";
import { connectWebSocketServer } from "./app/modules/chat/chat.websocket";

let server: Server;

async function main() {
  server = app.listen(config.port, () => {
    console.log("Bisnukhetri Sever is running on port ", config.port);
    seedAdmin()
    connectWebSocketServer(server)
  });
  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server closed!");
      });
    }
    process.exit(1);
  };
  process.on("uncaughtException", (error) => {
    console.log(error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.log(error);
    exitHandler();
  });
}

main();
