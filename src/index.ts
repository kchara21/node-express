import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import routes from "./routes/indexRoute";
import helmet from "helmet";
import 'dotenv/config'

class Server {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  config(): void {

 
    this.app.set("port", process.env.PORT || 3000);
    this.app.use(cors({ credentials: true }));
    this.app.use(
      helmet({
        contentSecurityPolicy: false,
      })
    );

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  routes(): void {
    this.app.use("/", routes);
    // this.app.use(express.static('public'));
  }

  start(): void {
    this.app.listen(this.app.get("port"), () => {
      console.log(`Server on port`, this.app.get("port"));
    });
  }
}

const server = new Server();
server.start();
