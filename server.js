
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PRICE = 190; // R$ 1,90 em centavos
const OBYPAY_URL = "https://api.obypay.app";

app.get("/", (req, res) => {
  res.send("Boca Mídias está funcionando!");
});

app.get("/health", (req, res) => {
  res.json({
    status: "online",
    project: "Boca Mídias"
  });
});

app.get("/status", (req, res) => {
  res.json({
    project: "Boca Mídias",
    paymentMode: "OBYPAY",
    price: 1.90,
    currency: "BRL",
    obypayConfigured: Boolean(process.env.OBYPAY_API_KEY),
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN)
  });
});

// Criar cobrança PIX
app.post("/create-pix", async (req, res) => {
  const apiKey = process.env.OBYPAY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "Chave ObyPay não configurada."
    });
  }

  const orderId = crypto.randomUUID();

  try {
    const response = await axios.post(
      `${OBYPAY_URL}/transactions`,
      {
        amount: PRICE,
        description: "Acesso ao grupo Boca Mídias",
        externalId: orderId
      },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const data = response.data;

    if (!data.id || !data.copyPaste) {
      throw new Error("Resposta da ObyPay incompleta.");
    }

    return res.status(201).json({
      success: true,
      status: data.status,
      orderId: orderId,
      transactionId: data.id,
      amount: data.amount,
      currency: "BRL",
      pixCopyPaste: data.copyPaste,
      qrCodeBase64: data.qrCodeBase64,
      expiresAt: data.expiresAt
    });

  } catch (error) {
    console.error(
      "Erro ObyPay:",
      error.response?.status || error.code || "Erro desconhecido"
    );

    return res.status(502).json({
      success: false,
      message: "Não foi possível criar o PIX.",
      obypayStatus: error.response?.status || null
    });
  }
});

app.listen(PORT, () => {
  console.log(`Boca Mídias rodando na porta ${PORT}`);
});
