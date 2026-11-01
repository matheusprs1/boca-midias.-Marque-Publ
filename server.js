const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Boca Mídias está funcionando!");
});

app.get("/health", (req, res) => {
  res.json({ status: "online" });
});

app.listen(PORT, () => {
  console.log(`Boca Mídias rodando na porta ${PORT}`);
});
