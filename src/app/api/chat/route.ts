import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    console.error("Unauthorized: No userId");
    return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "GROQ_API_KEY not configured",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Check Supabase config
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase not configured");
  }

  // Get Clerk token for Supabase auth
  const { getToken } = await auth();
  const clerkToken = await getToken();

  // Create Supabase client with Clerk token
  const supabase = supabaseUrl && supabaseKey && clerkToken
    ? createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
          },
        },
      })
    : null;

  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // First, use AI to detect if user wants to record a transaction
    const intentResult = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [{ role: "user", content: lastMessage }],
      system: `Anda adalah classifier intent. Tugas Anda adalah menentukan apakah user ingin mencatat transaksi keuangan.

Transaksi keuangan adalah:
- Pemasukan (income): menerima uang, gaji, freelance, bonus, dll
- Pengeluaran (expense): membayar, belanja, makan, transportasi, tagihan, dll

Respon HANYA dengan JSON format berikut:
{
  "intent": "record_transaction" atau "general_chat",
  "type": "income" atau "expense" atau null,
  "amount": number atau null,
  "category": string atau null,
  "description": string atau null,
  "date": "YYYY-MM-DD" atau null (hari ini jika tidak disebut)
}

Contoh:
- "Saya beli makan siang 50 ribu" -> {"intent": "record_transaction", "type": "expense", "amount": 50000, "category": "Makanan", "description": "Beli makan siang"}
- "Gaji masuk 5 juta" -> {"intent": "record_transaction", "type": "income", "amount": 5000000, "category": "Gaji", "description": "Gaji masuk"}
- "Apa tips menabung?" -> {"intent": "general_chat"}

Respon hanya dengan JSON, tanpa penjelasan lain.`,
    });

    let intentData: { 
      intent: string; 
      type?: string; 
      amount?: number; 
      category?: string; 
      description?: string; 
      date?: string;
    } = { intent: "general_chat" };
    try {
      // Extract JSON from response
      const jsonMatch = intentResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        intentData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse intent:", e);
    }

    // If intent is to record transaction, save to database
    let transactionResult = null;
    if (intentData.intent === "record_transaction" && supabase) {
      const { type, amount, category, description, date } = intentData;

      if (type && amount) {
        const defaultCategories = {
          income: ["Gaji", "Freelance", "Bonus", "Investasi", "Lainnya"],
          expense: ["Makanan", "Transportasi", "Belanja", "Hiburan", "Tagihan", "Kesehatan", "Pendidikan", "Lainnya"]
        };

        const validCategories = defaultCategories[type as keyof typeof defaultCategories];
        const selectedCategory = category || validCategories[0];

        const transactionData = {
          user_id: userId,
          type,
          amount: Number(amount),
          category: selectedCategory,
          description: description || `${type === "income" ? "Pemasukan" : "Pengeluaran"}: ${selectedCategory}`,
          date: date || new Date().toISOString().split("T")[0],
        };

        console.log("Saving transaction:", transactionData);

        const { data, error } = await supabase
          .from("transactions")
          .insert(transactionData)
          .select()
          .single();

        if (error) {
          console.error("Error saving transaction:", error);
          transactionResult = { success: false, error: error.message };
        } else {
          transactionResult = { success: true, data };
          
          // Revalidate dashboard cache to show fresh data
          revalidatePath('/dashboard/overview');
          console.log("Dashboard revalidated successfully");
        }
      }
    } else if (intentData.intent === "record_transaction" && !supabase) {
      transactionResult = { 
        success: false, 
        error: "Database tidak terkonfigurasi. Transaksi tidak dapat disimpan." 
      };
    }

    // Generate AI response
    const chatSystemPrompt = `Anda adalah Asisten Keuangan AI yang membantu pengguna mengelola keuangan pribadi mereka.

Tugas Anda:
- Memberikan saran tentang pengelolaan keuangan pribadi
- Membantu pengguna mencatat dan menganalisis pengeluaran
- Memberikan tips menabung dan investasi dasar
- Menjawab pertanyaan seputar keuangan dengan bijak dan bertanggung jawab

${transactionResult?.success ? 
  `✅ Transaksi berhasil dicatat!
Type: ${transactionResult.data.type}
Amount: Rp ${transactionResult.data.amount.toLocaleString("id-ID")}
Category: ${transactionResult.data.category}
Description: ${transactionResult.data.description}
Date: ${transactionResult.data.date}

Konfirmasi ke user bahwa transaksi sudah tersimpan dan berikan saran keuangan yang relevan.` 
  : transactionResult?.error ?
  `⚠️ Transaksi gagal disimpan: ${transactionResult.error}. Minta user untuk mencoba lagi atau cek koneksi internet.`
  : ''
}

PENTING:
- Gunakan bahasa Indonesia yang ramah dan mudah dipahami
- Jangan memberikan saran investasi berisiko tinggi tanpa peringatan
- Selalu ingatkan pengguna untuk bertanggung jawab dalam pengambilan keputusan keuangan
- Fokus pada edukasi keuangan yang sehat
- Jika user menyebutkan transaksi (pengeluaran/pemasukan), tawarkan untuk mencatatnya
- Setelah transaksi dicatat, berikan insight atau tips keuangan yang relevan`;

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages,
      system: chatSystemPrompt,
    });

    return Response.json({ 
      text: result.text,
      transaction: transactionResult,
      intent: intentData,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
