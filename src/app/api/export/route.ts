import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { generateCSV, generateExcel, generatePDF, formatDateForFilename } from "@/lib/export-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // --- SAAS: Check Subscription Tier (Pro Required) ---
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("tier, valid_until")
      .eq("user_id", userId)
      .single();

    let userTier = subscription?.tier || "free";
    
    // Check if Pro tier is expired
    if (userTier === "pro" && subscription?.valid_until) {
      const validUntil = new Date(subscription.valid_until);
      if (validUntil < new Date()) {
        userTier = "free"; // Expired
      }
    }

    if (userTier !== "pro") {
      return NextResponse.json(
        { 
          error: "Premium Feature", 
          details: "Export functionality is only available for Pro users. Please upgrade your plan." 
        },
        { status: 403 }
      );
    }
    // --- END SAAS LIMITS ---

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "csv"; // csv, excel, pdf
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const timeRange = searchParams.get("timeRange"); // For dashboard export

    // Calculate date range from timeRange if provided
    let calculatedStartDate = startDate;
    let calculatedEndDate = endDate;
    
    if (timeRange && !startDate && !endDate) {
      const now = new Date();
      const start = new Date();
      
      switch (timeRange) {
        case "1m":
          start.setMonth(now.getMonth() - 1);
          break;
        case "3m":
          start.setMonth(now.getMonth() - 3);
          break;
        case "6m":
          start.setMonth(now.getMonth() - 6);
          break;
        case "1y":
          start.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      calculatedStartDate = start.toISOString().split("T")[0];
      calculatedEndDate = now.toISOString().split("T")[0];
    }

    // Build query
    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId);

    // Apply filters
    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (calculatedStartDate) {
      query = query.gte("date", calculatedStartDate);
    }

    if (calculatedEndDate) {
      query = query.lte("date", calculatedEndDate);
    }

    // Order by date descending
    query = query.order("date", { ascending: false });

    const { data: transactions, error } = await query;

    if (error) {
      throw error;
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        { error: "No transactions found for the selected filters" },
        { status: 404 }
      );
    }

    // Generate filename with date
    const today = new Date();
    const filenameDate = formatDateForFilename(today);

    // Generate export based on format
    if (format === "csv") {
      const csvContent = generateCSV(transactions);

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="asisten-keuangan-${filenameDate}.csv"`,
        },
      });
    }

    if (format === "excel") {
      const excelBuffer = await generateExcel(transactions);

      return new Response(excelBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="asisten-keuangan-${filenameDate}.xlsx"`,
        },
      });
    }

    if (format === "pdf") {
      const pdfBuffer = await generatePDF(transactions, calculatedStartDate || undefined, calculatedEndDate || undefined);

      return new Response(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="laporan-keuangan-${filenameDate}.pdf"`,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid format. Supported formats: csv, excel, pdf" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error exporting data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to export data", details: errorMessage },
      { status: 500 }
    );
  }
}
