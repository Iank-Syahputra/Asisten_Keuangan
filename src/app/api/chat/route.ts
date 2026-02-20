import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    console.error("Unauthorized: No userId");
    return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  console.log("GROQ_API_KEY configured:", !!apiKey);
  console.log("GROQ_API_KEY starts with:", apiKey ? apiKey.substring(0, 10) + "..." : "NOT SET");

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "GROQ API key not configured. Please add GROQ_API_KEY to your environment variables.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const { messages } = await req.json();
    console.log("Messages received:", messages.length);

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages,
      system: `Anda adalah Asisten Keuangan AI yang membantu pengguna mengelola keuangan pribadi mereka.
Tugas Anda:
- Memberikan saran tentang pengelolaan keuangan pribadi
- Membantu pengguna mencatat dan menganalisis pengeluaran
- Memberikan tips menabung dan investasi dasar
- Menjawab pertanyaan seputar keuangan dengan bijak dan bertanggung jawab

PENTING:
- Gunakan bahasa Indonesia yang ramah dan mudah dipahami
- Jangan memberikan saran investasi berisiko tinggi tanpa peringatan
- Selalu ingatkan pengguna untuk bertanggung jawab dalam pengambilan keputusan keuangan
- Fokus pada edukasi keuangan yang sehat`,
    });

    return Response.json({ text: result.text });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error:
          "Failed to process chat request. Please check your API configuration.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
