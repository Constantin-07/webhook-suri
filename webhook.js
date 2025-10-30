import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/suri-webhook", async (req, res) => {
  try {
    const userMessage = req.body.text || "Olá"; // mensagem recebida da Suri

    const openaiResponse = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: userMessage,
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await openaiResponse.json();
    const resposta = data.choices?.[0]?.text?.trim() || "Não consegui gerar uma resposta.";

    // Retorno no formato que a Suri entende
    res.json({
      type: "FlowActionSendText",
      text: resposta
    });
  } catch (error) {
    console.error(error);
    res.json({
      type: "FlowActionSendText",
      text: "Ocorreu um erro ao processar sua solicitação."
    });
  }
});

app.listen(3000, () => console.log("Webhook da Suri rodando na porta 3000"));
