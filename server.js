
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PRICE = 1.90;

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
    price: PRICE,
    currency: "BRL",
    telegramConfigured: Boolean(
      process.env.TELEGRAM_BOT_TOKEN
    ),
    asaasTestConfigured: Boolean(
      process.env.ASAAS_API_KEY_TEST
    )
  });
});

// Teste de conexão com Asaas Sandbox
app.get("/asaas-test", async (req, res) => {
  const apiKey = process.env.ASAAS_API_KEY_TEST;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "Chave de teste não configurada."
    });
  }

  try {
    const response = await axios.get(
      "https://api-sandbox.asaas.com/v3/myAccount/status/",
      {
        headers: {
          access_token: apiKey,
          accept: "application/json"
        },
        timeout: 15000
      }
    );

    return res.json({
      success: true,
      mode: "SANDBOX",
      message: "Conexão com Asaas realizada!",
      httpStatus: response.status
    });

  } catch (error) {
    console.error(
      "Erro na conexão Asaas:",
      error.response?.status || error.code || "Erro desconhecido"
    );

    return res.status(502).json({
      success: false,
      message: "Não foi possível conectar ao Asaas Sandbox.",
      asaasStatus: error.response?.status || null
    });
  }
});

// Rota de demonstração
app.post("/create-checkout", (req, res) => {
  res.json({
    success: true,
    mode: "DEMO",
    message: "Servidor preparado para integração de pagamento.",
    amount: PRICE,
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
