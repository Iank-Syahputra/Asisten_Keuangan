import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
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

    // Get IDs from request body
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No transaction IDs provided" },
        { status: 400 }
      );
    }

    // Verify ownership before deleting (security check)
    // Only delete transactions that belong to the authenticated user
    const { data: existingTransactions } = await supabase
      .from("transactions")
      .select("id, user_id")
      .in("id", ids)
      .eq("user_id", userId);

    if (!existingTransactions || existingTransactions.length === 0) {
      return NextResponse.json(
        { error: "No transactions found" },
        { status: 404 }
      );
    }

    // Check if user owns all transactions they're trying to delete
    const ownedIds = existingTransactions.map(t => t.id);
    const unauthorizedIds = ids.filter(id => !ownedIds.includes(id));
    
    if (unauthorizedIds.length > 0) {
      return NextResponse.json(
        { 
          error: "Unauthorized to delete some transactions",
          deletedCount: ownedIds.length,
          unauthorizedCount: unauthorizedIds.length
        },
        { status: 403 }
      );
    }

    // Delete transactions
    const { error } = await supabase
      .from("transactions")
      .delete()
      .in("id", ids);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: ids.length,
      message: `Successfully deleted ${ids.length} transactions`
    });
  } catch (error) {
    console.error("Error bulk deleting transactions:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete transactions", details: errorMessage },
      { status: 500 }
    );
  }
}
