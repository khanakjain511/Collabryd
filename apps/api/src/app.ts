import express,{ type Express }  from "express";
import { db, users } from "@collabryd/database";
import UserRouter from "./Routers/user.route.js";

const app: Express = express();

app.use(express.json());

app.use("/users",UserRouter);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

export default app;
