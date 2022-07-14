import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import routes from "./routes";
import morgan from "morgan";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("dev"));

app.use("/", routes);

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
