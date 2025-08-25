import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());



const port = process.env.PORT || 8001;

app.get("/", (req, res) => {
  res.send({ message: "Hello from server!" });
});

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});