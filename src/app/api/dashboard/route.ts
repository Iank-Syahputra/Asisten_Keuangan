import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

// Force dynamic rendering for real-time data
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Get user ID directly from Clerk auth()
    const { userId } = await auth();

    if (!userId) {
      console.warn("No auth token found");
      return NextResponse.json({ error: "Unauthorized - Please login first" }, { status: 401 });
    }

    // Get token for Supabase authorization
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      console.warn("No token found");
      return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 });
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase credentials not configured");
      console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "SET" : "MISSING");
      console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "SET" : "MISSING");
      return NextResponse.json({
        error: "Supabase not configured",
        message: "Please configure Supabase credentials in environment variables",
        hint: "Check .env file for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
      }, { status: 503 });
    }

    // Create Supabase client with Clerk token
    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Use userId from auth() directly (more reliable than token.sub)
    const clerkUserId = userId;
    console.log("Fetching data for user:", clerkUserId);

    // Get time range from query params (default: 6 months)
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get("timeRange") || "6m";

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "1m":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3m":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6m":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }

    console.log("Fetching transactions from:", startDate.toISOString(), "to:", now.toISOString());
    console.log("User ID:", clerkUserId);

    // Fetch ALL transactions first (no date filter) for debugging
    const { data: allTransactions, error: allTransactionsError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", clerkUserId)
      .order("date", { ascending: false });

    console.log("All transactions count:", allTransactions?.length || 0);
    if (allTransactionsError) {
      console.error("Error fetching all transactions:", allTransactionsError);
    }

    // Fetch transactions from Supabase with date filter
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", clerkUserId)
      .gte("date", startDate.toISOString().split('T')[0]) // Use date string only (YYYY-MM-DD)
      .order("date", { ascending: false });

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError);
      console.error("Error details:", JSON.stringify(transactionsError, null, 2));

      // Check if it's a table not found error
      if (transactionsError.code === 'PGRST116') {
        return NextResponse.json({
          error: "Table not found",
          message: "The 'transactions' table doesn't exist in your Supabase database",
          hint: "Please run the SQL migration from supabase/migrations/001_create_tables.sql"
        }, { status: 400 });
      }

      // Check if it's a permission/RLS error
      if (transactionsError.code === 'PGRST301') {
        return NextResponse.json({
          error: "Permission denied",
          message: "Check your Row Level Security (RLS) policies in Supabase",
          hint: "Make sure RLS policies allow users to read their own transactions"
        }, { status: 403 });
      }

      return NextResponse.json({
        error: "Failed to fetch transactions",
        details: transactionsError.message,
        code: transactionsError.code
      }, { status: 500 });
    }

    console.log("Filtered transactions count:", transactions?.length || 0);
    console.log("Filtered transactions:", transactions);

    // Fetch savings if table exists
    const { data: savingsData, error: savingsError } = await supabase
      .from("savings")
      .select("*")
      .eq("user_id", clerkUserId);

    if (savingsError) {
      console.warn("Savings table not found or error:", savingsError.message);
    }

    // Process the data
    const totalIncome = transactions
      ?.filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalExpense = transactions
      ?.filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalBalance = totalIncome - totalExpense;
    const totalSavings = savingsData?.reduce((sum, s) => sum + Number(s.current_amount), 0) || 0;

    // Group by month for trend data
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    transactions?.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = monthNames[date.getMonth()];

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }

      if (t.type === "income") {
        monthlyData[monthKey].income += Number(t.amount);
      } else {
        monthlyData[monthKey].expense += Number(t.amount);
      }
    });

    const incomeExpenseTrend = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
    }));

    // Category breakdown for expenses
    const categoryData: Record<string, number> = {};
    const categoryColors: Record<string, string> = {
      "Makanan": "#10b981",
      "Transportasi": "#3b82f6",
      "Belanja": "#f59e0b",
      "Hiburan": "#ef4444",
      "Tagihan": "#8b5cf6",
      "Kesehatan": "#ec4899",
      "Pendidikan": "#06b6d4",
      "Lainnya": "#6b7280",
    };

    transactions
      ?.filter((t) => t.type === "expense")
      .forEach((t) => {
        const category = t.category || "Lainnya";
        categoryData[category] = (categoryData[category] || 0) + Number(t.amount);
      });

    const categoryBreakdown = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || "#6b7280",
    })).sort((a, b) => b.value - a.value);

    // Savings trend (monthly savings)
    const savingsTrend = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      savings: data.income - data.expense,
    }));

    // Recent transactions (last 10)
    const recentTransactions = (transactions || []).slice(0, 10).map((t) => ({
      id: t.id,
      type: t.type,
      category: t.category,
      amount: Number(t.amount),
      date: new Date(t.date).toISOString().split("T")[0],
      description: t.description,
    }));

    return NextResponse.json({
      totalBalance,
      totalIncome,
      totalExpense,
      totalSavings,
      incomeExpenseTrend: incomeExpenseTrend || [],
      categoryBreakdown: categoryBreakdown || [],
      savingsTrend: savingsTrend || [],
      recentTransactions: recentTransactions || [],
      _debug: {
        transactionsCount: transactions?.length || 0,
        hasAnyData: !!(transactions && transactions.length > 0),
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch dashboard data", details: errorMessage },
      { status: 500 }
    );
  }
}
