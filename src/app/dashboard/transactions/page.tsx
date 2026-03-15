"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { TransactionDeleteDialog } from "@/components/transaction-delete-dialog";
import { TransactionEditDialog } from "@/components/transaction-edit-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Dialog states
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (typeFilter !== "all") params.append("type", typeFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/transactions?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengambil data");
      }

      setTransactions(result.transactions);
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error("Gagal memuat transaksi", { description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, typeFilter, categoryFilter, startDate, endDate, searchQuery]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = useCallback(async () => {
    if (!transactionToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/transactions/${transactionToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus transaksi");
      }

      toast.success("Transaksi berhasil dihapus");
      fetchTransactions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error("Gagal menghapus transaksi", { description: errorMessage });
    } finally {
      setIsDeleting(false);
      setTransactionToDelete(null);
    }
  }, [transactionToDelete, fetchTransactions]);

  const handleEdit = useCallback(
    async (data: Omit<Transaction, "id">) => {
      if (!transactionToEdit) return;

      setIsEditing(true);
      try {
        const response = await fetch(`/api/transactions/${transactionToEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Gagal mengupdate transaksi");
        }

        toast.success("Transaksi berhasil diupdate");
        fetchTransactions();
        setTransactionToEdit(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
        toast.error("Gagal mengupdate transaksi", { description: errorMessage });
      } finally {
        setIsEditing(false);
      }
    },
    [transactionToEdit, fetchTransactions]
  );

  const handleAdd = useCallback(
    async (data: Omit<Transaction, "id">) => {
      setIsAdding(true);
      try {
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Gagal menambah transaksi");
        }

        toast.success("Transaksi berhasil ditambahkan");
        fetchTransactions();
        setIsAdding(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
        toast.error("Gagal menambah transaksi", { description: errorMessage });
        setIsAdding(false);
      }
    },
    [fetchTransactions]
  );

  const clearFilters = () => {
    setTypeFilter("all");
    setCategoryFilter("all");
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = typeFilter !== "all" || categoryFilter !== "all" || searchQuery || startDate || endDate;

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      {/* Ambient BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-3xl" />
      </div>

      {/* NAV */}
      <nav className="relative z-50 w-full border-b border-white/5 backdrop-blur-sm bg-gray-950/80 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/overview")}
              className="text-gray-400 hover:text-white hover:bg-white/5 text-sm px-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Kembali</span>
            </Button>

            <div className="w-px h-5 bg-white/10" />

            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-2 rounded-xl">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">
                Asisten <span className="text-emerald-400">Keuangan</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Semua Transaksi</h1>
            <p className="text-sm text-gray-500">Kelola dan lihat riwayat transaksi Anda</p>
          </div>
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </Button>
        </div>

        <SignedIn>
          {/* Filters */}
          <Card className="bg-gray-900 border-white/5 rounded-2xl p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari transaksi..."
                  className="pl-10 bg-gray-800 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-[150px] bg-gray-800 border-white/10 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/10">
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-[150px] bg-gray-800 border-white/10 text-white">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/10">
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="Makanan">Makanan</SelectItem>
                  <SelectItem value="Transportasi">Transportasi</SelectItem>
                  <SelectItem value="Belanja">Belanja</SelectItem>
                  <SelectItem value="Hiburan">Hiburan</SelectItem>
                  <SelectItem value="Tagihan">Tagihan</SelectItem>
                  <SelectItem value="Gaji">Gaji</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full lg:w-[150px] bg-gray-800 border-white/10 text-white"
                  placeholder="Dari"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full lg:w-[150px] bg-gray-800 border-white/10 text-white"
                  placeholder="Sampai"
                />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-white/10 hover:bg-gray-700 text-gray-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">
              Menampilkan {transactions.length} dari {pagination.total} transaksi
            </p>
            {hasActiveFilters && (
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                Filter Aktif
              </Badge>
            )}
          </div>

          {/* Transactions List */}
          {loading ? (
            <Card className="bg-gray-900 border-white/5 rounded-2xl p-8">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Memuat transaksi...</p>
              </div>
            </Card>
          ) : transactions.length === 0 ? (
            <Card className="bg-gray-900 border-white/5 rounded-2xl p-8">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-white/5 flex items-center justify-center text-gray-500 mb-4">
                  <Wallet className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Belum ada transaksi</h3>
                <p className="text-gray-400 text-sm mb-4 max-w-md">
                  {hasActiveFilters
                    ? "Tidak ada transaksi yang sesuai dengan filter yang dipilih"
                    : "Mulai tambahkan transaksi pertama Anda untuk melihat riwayat keuangan"}
                </p>
                {hasActiveFilters ? (
                  <Button onClick={clearFilters} variant="outline" className="border-white/10">
                    Hapus Filter
                  </Button>
                ) : (
                  <Button onClick={() => setIsAdding(true)} className="bg-emerald-600 hover:bg-emerald-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Transaksi Pertama
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <>
              <Card className="bg-gray-900 border-white/5 rounded-2xl overflow-hidden">
                <div className="divide-y divide-white/5">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            transaction.type === "income"
                              ? "bg-emerald-500/10 border border-emerald-500/20"
                              : "bg-red-500/10 border border-red-500/20"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-white truncate">
                              {transaction.description || transaction.category}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                transaction.type === "income"
                                  ? "border-emerald-500/50 text-emerald-400"
                                  : "border-red-500/50 text-red-400"
                              }`}
                            >
                              {transaction.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(transaction.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-base font-bold ${
                            transaction.type === "income" ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTransactionToEdit(transaction)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 w-8 p-0"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTransactionToDelete(transaction)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="border-white/10 hover:bg-gray-800 text-gray-300 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPagination({ ...pagination, page: pageNum })}
                          className={
                            pagination.page === pageNum
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                              : "border-white/10 hover:bg-gray-800 text-gray-300"
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="border-white/10 hover:bg-gray-800 text-gray-300 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </SignedIn>

        <SignedOut>
          <Card className="bg-gray-900 border-white/5 rounded-2xl p-8">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Wallet className="w-8 h-8" />
              </div>
              <p className="text-lg font-semibold text-white mb-2">Masuk untuk melihat transaksi</p>
              <p className="text-sm text-gray-500 mb-6">Login untuk mengelola transaksi keuangan Anda</p>
              <SignInButton>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 rounded-xl font-medium">
                  Masuk Sekarang
                </Button>
              </SignInButton>
            </div>
          </Card>
        </SignedOut>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-gray-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-1.5 rounded-lg">
              <Wallet className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold">
              Asisten <span className="text-emerald-400">Keuangan</span>
            </span>
          </div>
          <p className="text-[11px] text-gray-600">© 2026 Asisten Keuangan. Semua hak dilindungi.</p>
        </div>
      </footer>

      {/* Dialogs */}
      <TransactionDeleteDialog
        transaction={transactionToDelete}
        open={!!transactionToDelete}
        onOpenChange={(open) => {
          if (!open) setTransactionToDelete(null);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      <TransactionEditDialog
        transaction={transactionToEdit}
        open={!!transactionToEdit}
        onOpenChange={(open) => {
          if (!open) setTransactionToEdit(null);
        }}
        onSave={handleEdit}
        isLoading={isEditing}
      />

      <TransactionEditDialog
        transaction={null}
        open={isAdding}
        onOpenChange={(open) => {
          if (!open) setIsAdding(false);
        }}
        onSave={handleAdd}
        isLoading={isAdding}
      />
    </div>
  );
}

// Card Component
function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
