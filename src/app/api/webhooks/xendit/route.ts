import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // 1. Verifikasi bahwa request benar-benar dari Xendit
    const xenditWebhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
    const requestToken = request.headers.get("x-callback-token");

    if (xenditWebhookToken && requestToken !== xenditWebhookToken) {
      console.warn("Invalid Xendit Webhook Token");
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // 2. Ambil data dari body request
    const body = await request.json();
    console.log("Xendit Webhook Received:", body);

    // 3. Cek apakah ini adalah notifikasi Invoice yang SUDAH DIBAYAR
    // Xendit mengirim status 'PAID' atau 'SETTLED' untuk invoice sukses
    if (body.status === "PAID" || body.status === "SETTLED") {
      const externalId = body.external_id; // Format yang kita buat: invoice-{userId}-{timestamp}
      
      if (!externalId) {
        return NextResponse.json({ error: "Missing external_id" }, { status: 400 });
      }

      // 4. Update Database Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Hitung masa aktif (Misal: Hari ini + 30 hari)
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      // Update user_subscriptions berdasarkan xendit_invoice_id
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          tier: 'pro',
          valid_until: validUntil.toISOString()
        })
        .eq('xendit_invoice_id', externalId);

      if (error) {
        console.error("Supabase update error:", error);
        return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
      }

      console.log(`Successfully upgraded user for invoice ${externalId} to Pro!`);
    }

    // Selalu respon 200 OK agar Xendit tahu kita sudah menerima pesannya
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Xendit webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
