import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_API_KEY_GEMINI;
const BOT_NAME = "HomeCo"

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 200,
  responseMimeType: "text/plain",
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- Function to call Google Generative AI ---
export const getGoogleGenAIResponse = async (message, chatHistory) => {
  if (!API_KEY || API_KEY === "YOUR_GOOGLE_GEMINI_API_KEY") {
    return "Silakan konfigurasi kunci API Google Gemini Anda dalam kode untuk menggunakan fitur ini.";
  }

  try {
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: chatHistory,
    });

    const prompt = `Anda adalah ${BOT_NAME}, asisten yang ramah dan berpengetahuan, ahli dalam segala hal tentang kopi dan pemanggangan kopi.
        Tujuan utama Anda adalah menjawab pertanyaan dan mendiskusikan topik yang terkait dengan kopi, biji kopi, teknik pemanggangan, metode pembuatan kopi, budaya kopi, espresso, latte art, dll.
        Jika pengguna bertanya tentang sesuatu yang tidak berhubungan dengan kopi, tolaklah dengan sopan dan arahkan percakapan kembali ke topik kopi.
        Berikan jawaban yang ringkas dan informatif, biasanya 1-3 kalimat kecuali jika diminta lebih detail.
        Jawab selalu dalam Bahasa Indonesia.

        Pesan pengguna saat ini: "${message}"`;

    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();
    return responseText;

  } catch (error) {
    console.error("Error calling Google Generative AI:", error);
    if (error.message.includes("API key not valid")) {
      return "Ada masalah dengan kunci API. Silakan periksa dan coba lagi.";
    }
    if (error.message.includes("quota")) {
      return "Sepertinya saya telah mencapai batas penggunaan saya. Silakan coba lagi nanti.";
    }
    // Check for safety blocks
    if (error.response && error.response.promptFeedback && error.response.promptFeedback.blockReason) {
      console.warn("Blocked due to safety settings:", error.response.promptFeedback.blockReason);
      return "Maaf, saya tidak dapat merespons itu karena pedoman keamanan. Mari kita bicara tentang kopi!";
    }
    return "Maaf, saya mengalami kesalahan saat mencoba memproses permintaan Anda. Mari kita fokus membicarakan kopi!";
  }
};
