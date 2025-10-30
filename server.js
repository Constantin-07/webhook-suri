import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Rota GET para testar se o servidor está online
app.get("/", (req, res) => {
  res.send("🚀 Webhook da Suri está online!");
});

// Rota POST para receber mensagens da Suri
app.post("/suri-webhook", async (req, res) => {
  try {
    // Pega a mensagem enviada pela Suri
    const userMessage = req.body.text?.trim() || "Olá!";

    // Requisição para a OpenAI (GPT-3.5-turbo)
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Você é um assistente útil e educado." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await openaiResponse.json();

    // Pega a resposta da IA
    const resposta = data.choices?.[0]?.message?.content?.trim() || 
                     "Não consegui gerar uma resposta.";

    // Retorno no formato que a Suri entende
    res.json({
      type: "FlowActionSendText",
      text: resposta
    });

  } catch (error) {
    console.error("Erro ao chamar OpenAI:", error);
    res.json({
      type: "FlowActionSendText",
      text: "Ocorreu um erro ao processar sua solicitação."
    });
  }
});

// Porta dinâmica para Render ou fallback local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Webhook da Suri rodando na porta ${PORT}`));
