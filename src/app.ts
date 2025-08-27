import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/errorHandlers/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import { envVars } from "./app/config/env";

const app = express();

app.use(
  cors({
    origin: [envVars.FRONTEND_URL,"http://localhost:5173"],
    credentials: true,

  })
);

app.use(
  expressSession({
    secret: "Your Secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.json());

app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());




app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Digital Wallet Backend",
  });
});

app.use(notFound);

app.use(globalErrorHandler);

export default app;
