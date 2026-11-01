const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Página inicial
app.get("/", (req, res) => {
  res.send("Boca Mídias está funcionando!");
});

// Verificação do servidor
app.get("/health", (req, res) => {
  res.json({
    status: "online",
    project: "Boca Mídias"
  });
});

// Informações do sistema
app.get("/status", (req, res) => {
  res.json({
    project: "Boca Mídias",
    paymentMode: "DEMO",
    price: 1.90,
    currency: "BRL",
    telegramConfigured: Boolean(
      process.env.TELEGRAM_BOT_TOKEN
    )
  });
});

// Rota de demonstração
app.post("/create-checkout", (req, res) => {
  res.json({
    success: true,
    mode: "DEMO",
    message: "Servidor preparado para integração de pagamento.",
    amount: 1.90,
    currency: "BRL",
    paymentCreated: false
  });
});

// Inicialização
app.listen(PORT, () => {
  console.log(
    `Boca Mídias rodando na porta ${PORT}`
  );
});
