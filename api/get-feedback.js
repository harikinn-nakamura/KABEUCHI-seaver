// api/get-feedback.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Vercelの環境変数からAPIキーを安全に取得
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
  // 拡張機能からのリクエストでなければ無視
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const userText = req.body.text; // 拡張機能から送られてくるテキスト

    if (!userText) {
      return res.status(400).json({ error: 'テキストが指定されていません。' });
    }

    const prompt = `あなたは、優秀な批評家です。以下の文章を分析し、その主張の弱点、論理的な飛躍、考えられる反論、そして改善案を、具体的かつ手厳しく指摘してください。\n\n---\n\n${userText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    // 成功したら、AIの回答をJSON形式で返す
    res.status(200).json({ feedback: aiText });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AIとの通信中にエラーが発生しました。' });
  }
};