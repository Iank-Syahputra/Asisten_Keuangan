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
  Download,
  FileSpreadsheet,
  FileText,
  FileBox,
  Square,
  CheckSquare2,
  Trash,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { TransactionDeleteDialog } from "@/components/transaction-delete-dialog";
import { TransactionEditDialog } from "@/components/transaction-edit-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

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
  
  // Export states
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "pdf">("csv");
  const [exportType, setExportType] = useState<"all" | "income" | "expense">("all");
  
  // Bulk delete states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

  // Bulk delete handlers
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map(t => t.id)));
    }
  }, [transactions, selectedIds]);

  const toggleSelectTransaction = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    setIsBulkDeleting(true);
    
    // Optimistic update - store deleted transactions for undo
    const transactionsToDelete = transactions.filter(t => selectedIds.has(t.id));
    
    // Remove from UI immediately
    setTransactions(prev => prev.filter(t => !selectedIds.has(t.id)));
    setSelectedIds(new Set());

    try {
      const response = await fetch(`/api/transactions/bulk-delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus transaksi");
      }

      toast.success(`Berhasil menghapus ${transactionsToDelete.length} transaksi`, {
        description: "Klik undo untuk membatalkan",
        action: {
          label: "Undo",
          onClick: () => {
            // Restore transactions
            setTransactions(prev => [...transactionsToDelete, ...prev].sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            ));
            toast.success("Penghapusan dibatalkan");
          },
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error("Gagal menghapus transaksi", { description: errorMessage });
      
      // Rollback - restore transactions
      setTransactions(prev => [...transactionsToDelete, ...prev].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } finally {
      setIsBulkDeleting(false);
    }
  }, [selectedIds, transactions]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Build query params
      const params = new URLSearchParams({
        format: exportFormat,
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (exportType !== "all") params.append("type", exportType);
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      // Call export API
      const response = await fetch(`/api/export?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal export data");
      }

      // Get blob from response
      const blob = await response.blob();
      
      // Determine file extension and content type
      const extension = exportFormat === "csv" ? "csv" : exportFormat === "excel" ? "xlsx" : "pdf";
      const contentType = exportFormat === "csv" 
        ? "text/csv" 
        : exportFormat === "excel" 
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf";

      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob], { type: contentType }));
      const link = document.createElement("a");
      link.href = url;
      
      // Generate filename with date
      const today = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `asisten-keuangan-${today}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export berhasil!", {
        description: `File ${extension.toUpperCase()} sedang diunduh`,
      });
      
      setIsExportDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error("Gagal export data", {
        description: errorMessage,
      });
    } finally {
      setIsExporting(false);
    }
  }, [exportFormat, exportType, startDate, endDate, categoryFilter]);

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
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Semua Transaksi</h1>
            <p className="text-sm text-gray-500">Kelola dan lihat riwayat transaksi Anda</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIds.size > 0 && (
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                disabled={isBulkDeleting}
                className="bg-red-600 hover:bg-red-500 text-white gap-2 h-9"
              >
                <Trash className="w-4 h-4" />
                <span className="hidden sm:inline">Hapus {selectedIds.size} Terpilih</span>
                <span className="sm:hidden">Hapus {selectedIds.size}</span>
              </Button>
            )}
            <Button
              onClick={() => setIsExportDialogOpen(true)}
              variant="outline"
              className="border-white/10 hover:bg-white/5 text-gray-300 gap-2 h-9"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 h-9"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah</span>
            </Button>
          </div>
        </div>

        <SignedIn>
          {/* Filters */}
          <Card className="bg-gray-900 border-white/5 rounded-2xl p-4 mb-6">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari transaksi..."
                  className="pl-10 bg-gray-800 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-3">
                {/* Type Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-auto flex-1 sm:flex-none min-w-[140px] bg-gray-800 border-white/10 text-white">
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
                  <SelectTrigger className="w-full sm:w-auto flex-1 sm:flex-none min-w-[140px] bg-gray-800 border-white/10 text-white">
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
              </div>

              {/* Date Range */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-400 mb-1 block">Dari Tanggal</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-gray-800 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-gray-400 mb-1 block">Sampai Tanggal</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-gray-800 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-white/10 hover:bg-gray-700 text-gray-300 w-full sm:w-auto"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>

          {/* Results Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-gray-400">
                Menampilkan {transactions.length} dari {pagination.total} transaksi
              </p>
              {transactions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="h-7 text-gray-400 hover:text-white text-xs"
                >
                  {selectedIds.size === transactions.length ? (
                    <>
                      <CheckSquare2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                      Batal
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 mr-1.5" />
                      Pilih Semua
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hasActiveFilters && (
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-xs">
                  Filter Aktif
                </Badge>
              )}
              {selectedIds.size > 0 && (
                <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs">
                  {selectedIds.size} dipilih
                </Badge>
              )}
            </div>
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
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 transition-colors group gap-3 ${
                        selectedIds.has(transaction.id)
                          ? 'bg-blue-500/10 border-l-2 border-l-blue-500'
                          : 'hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {(selectedIds.size > 0 || transactions.length > 0) && (
                          <Checkbox
                            checked={selectedIds.has(transaction.id)}
                            onCheckedChange={() => toggleSelectTransaction(transaction.id)}
                            className={`border-gray-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 shrink-0 ${
                              selectedIds.size === 0 && !selectedIds.has(transaction.id) ? 'invisible' : ''
                            }`}
                          />
                        )}
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            transaction.type === "income"
                              ? "bg-emerald-500/10 border border-emerald-500/20"
                              : "bg-red-500/10 border border-red-500/20"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-sm font-medium text-white truncate">
                              {transaction.description || transaction.category}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-xs shrink-0 ${
                                transaction.type === "income"
                                  ? "border-emerald-500/50 text-emerald-400"
                                  : "border-red-500/50 text-red-400"
                              }`}
                            >
                              {transaction.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span className="truncate">{formatDate(transaction.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <span
                          className={`text-sm sm:text-base font-bold whitespace-nowrap ${
                            transaction.type === "income" ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTransactionToEdit(transaction)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 w-8 p-0 shrink-0"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTransactionToDelete(transaction)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0 shrink-0"
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

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Download className="w-5 h-5 text-emerald-400" />
              Export Transaksi
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Pilih format dan filter untuk export data transaksi Anda
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label className="text-gray-300">Format File</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={exportFormat === "csv" ? "default" : "outline"}
                  onClick={() => setExportFormat("csv")}
                  className={`flex flex-col items-center gap-2 h-20 ${
                    exportFormat === "csv"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "border-white/10 hover:bg-white/5"
                  }`}
                >
                  <FileBox className="w-6 h-6" />
                  <span className="text-xs">CSV</span>
                </Button>
                <Button
                  variant={exportFormat === "excel" ? "default" : "outline"}
                  onClick={() => setExportFormat("excel")}
                  className={`flex flex-col items-center gap-2 h-20 ${
                    exportFormat === "excel"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "border-white/10 hover:bg-white/5"
                  }`}
                >
                  <FileSpreadsheet className="w-6 h-6" />
                  <span className="text-xs">Excel</span>
                </Button>
                <Button
                  variant={exportFormat === "pdf" ? "default" : "outline"}
                  onClick={() => setExportFormat("pdf")}
                  className={`flex flex-col items-center gap-2 h-20 ${
                    exportFormat === "pdf"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "border-white/10 hover:bg-white/5"
                  }`}
                >
                  <FileText className="w-6 h-6" />
                  <span className="text-xs">PDF</span>
                </Button>
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label className="text-gray-300">Tipe Transaksi</Label>
              <Select value={exportType} onValueChange={(v) => setExportType(v as typeof exportType)}>
                <SelectTrigger className="bg-gray-800 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/10">
                  <SelectItem value="all">Semua Transaksi</SelectItem>
                  <SelectItem value="income">Pemasukan Saja</SelectItem>
                  <SelectItem value="expense">Pengeluaran Saja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Info */}
            {(startDate || endDate) && (
              <Card className="bg-gray-800 border-white/10 p-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Periode: {startDate || "..."} s/d {endDate || "..."}
                  </span>
                </div>
              </Card>
            )}

            {/* Info Box */}
            <Card className="bg-blue-500/10 border-blue-500/20 p-3">
              <p className="text-xs text-blue-300">
                💡 Tip: Format Excel mencakup 3 sheet: Transaksi, Ringkasan Kategori, dan Trend Bulanan
              </p>
            </Card>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
              disabled={isExporting}
              className="border-white/10 hover:bg-white/5"
            >
              Batal
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-emerald-600 hover:bg-emerald-500 gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
