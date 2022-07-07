import express, { Request, Response } from "express";
import helmet from "helmet";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
