// api/get-feedback.js (CORS対応版)

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
  // ★★★ CORSヘッダーを追加して、全てのオリジンからの通信を許可 ★★★
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ブラウザが送ってくる事前のOPTIONSリクエストに対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const userText = req.body.text;

    if (!userText) {
      return res.status(400).json({ error: 'テキストが指定されていません。' });
    }

    const prompt = `あなたは、優秀な批評家です。以下の文章を分析し、その主張の弱点、論理的な飛躍、考えられる反論、そして改善案を、具体的かつ手厳しく指摘してください。\n\n---\n\n${userText}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();
    
    res.status(200).json({ feedback: aiText });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AIとの通信中にエラーが発生しました。' });
  }
};