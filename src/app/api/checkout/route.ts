import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Xendit } from "xendit-node";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Dapatkan user yang sedang login
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Inisialisasi Xendit
    const xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY! });
    const invoiceService = xenditClient.Invoice;

    // 3. Konfigurasi Invoice
    const externalId = `invoice-${userId}-${Date.now()}`;
    const amount = 29000; // Harga Tier Pro (Rp 29.000)

    // Data request ke Xendit
    const invoiceData = {
      externalId: externalId,
      amount: amount,
      description: "Upgrade Asisten Keuangan ke Tier Pro (30 Hari)",
      customer: {
        givenNames: user.firstName || "User",
        email: user.emailAddresses[0]?.emailAddress,
      },
      // Link setelah berhasil atau gagal bayar
      successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/transactions?payment=success`,
      failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/transactions?payment=failed`,
      currency: "IDR",
    };

    // 4. Minta Xendit membuat Invoice
    const xenditResponse = await invoiceService.createInvoice({ data: invoiceData });

    if (!xenditResponse || !xenditResponse.invoiceUrl) {
      throw new Error("Gagal mendapatkan link pembayaran dari Xendit");
    }

    // 5. Simpan niat/rencana pembayaran ini ke Supabase
    // Gunakan service role key karena kita mengupdate di backend
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Kita simpan external_id (Invoice ID Xendit) ke tabel kita
    await supabase
      .from('user_subscriptions')
      .update({ xendit_invoice_id: externalId })
      .eq('user_id', userId);

    // 6. Kembalikan URL pembayaran ke Frontend
    return NextResponse.json({ 
      success: true, 
      invoiceUrl: xenditResponse.invoiceUrl 
    });

  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Gagal memproses checkout", details: errorMessage },
      { status: 500 }
    );
  }
}
