import { Router } from "express";
import healthRouter from "./health.routes.js";
import v1Router from "./v1.routes.js";

const apiRouter: Router = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/v1", v1Router);

export default apiRouter;
