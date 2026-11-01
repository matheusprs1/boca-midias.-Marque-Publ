
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PRICE = 1.90;
const ASAAS_URL = "https://api-sandbox.asaas.com/v3";

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
      `${ASAAS_URL}/myAccount/status/`,
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
      error.response?.status || error.code
    );

    return res.status(502).json({
      success: false,
      message: "Falha na conexão com Asaas.",
      asaasStatus: error.response?.status || null
    });
  }
});

// Criar Checkout Pix de teste
app.post("/create-checkout-test", async (req, res) => {
  const apiKey = process.env.ASAAS_API_KEY_TEST;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "Chave Sandbox não configurada."
    });
  }

  const orderId = crypto.randomUUID();

  try {
    const response = await axios.post(
      `${ASAAS_URL}/checkouts`,
      {
        billingTypes: ["PIX"],
        chargeTypes: ["DETACHED"],
        minutesToExpire: 30,
        externalReference: orderId,

        callback: {
          successUrl: "https://boca-midias-marque-publ.onrender.com/",
          cancelUrl: "https://boca-midias-marque-publ.onrender.com/",
          expiredUrl: "https://boca-midias-marque-publ.onrender.com/"
        },

        items: [
          {
            name: "Acesso Boca Mídias",
            description: "Acesso ao grupo privado Boca Mídias",
            quantity: 1,
            value: PRICE
          }
        ]
      },
      {
        headers: {
          access_token: apiKey,
          "Content-Type": "application/json",
          accept: "application/json"
        },
        timeout: 20000
      }
    );

    const checkoutId = response.data.id;

    if (!checkoutId) {
      throw new Error("Asaas não retornou o ID do Checkout.");
    }

    return res.json({
      success: true,
      mode: "SANDBOX",
      amount: PRICE,
      currency: "BRL",
      checkoutId: checkoutId,
      orderId: orderId,
      checkoutUrl:
        `https://asaas.com/checkoutSession/show?id=${checkoutId}`
    });

  } catch (error) {
    console.error(
      "Erro ao criar Checkout:",
      error.response?.data || error.message
    );

    return res.status(502).json({
      success: false,
      message: "Não foi possível criar o Checkout de teste.",
      asaasStatus: error.response?.status || null
    });
  }
});

// Rota antiga de demonstração
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
