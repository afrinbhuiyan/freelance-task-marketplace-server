const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Freelance Task Marketplace Server is running");
});

app.listen(port, () => {
  console.log(`Freelance Task Marketplace Server is running on port, ${port}`);
});