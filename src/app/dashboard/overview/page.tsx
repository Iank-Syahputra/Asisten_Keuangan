"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  ArrowLeft,
  Calendar,
  RefreshCcw,
  AlertCircle,
  Trash2,
  Download,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { TransactionDeleteDialog } from "@/components/transaction-delete-dialog";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardData } from "@/types/database";

// Note: Data fetching is handled client-side with useEffect
// API route has force-dynamic and revalidate = 0 for real-time data

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatCompactCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(1)}M`;
  }
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}Jt`;
  }
  return `Rp ${(value / 1000).toFixed(0)}rb`;
};

export default function DashboardOverview() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("6m");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Delete transaction states
  const [transactionToDelete, setTransactionToDelete] = useState<DashboardData["recentTransactions"][0] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedTransaction, setDeletedTransaction] = useState<typeof transactionToDelete | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  
  // Export state
  const [isExporting, setIsExporting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard?timeRange=${timeRange}`);
      const result = await response.json();

      console.log("Dashboard API Response:", result);

      if (!response.ok) {
        throw new Error(result.message || result.error || "Gagal mengambil data dashboard");
      }

      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(errorMessage);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Export current period data as PDF
      const params = new URLSearchParams({
        format: "pdf",
        timeRange: timeRange,
      });

      const response = await fetch(`/api/export?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal export data");
      }

      // Get blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const today = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `laporan-keuangan-${today}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export berhasil!", {
        description: "Laporan PDF sedang diunduh",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error("Gagal export data", {
        description: errorMessage,
      });
    } finally {
      setIsExporting(false);
    }
  }, [timeRange]);

  const handleDeleteTransaction = useCallback(async (transactionId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus transaksi");
      }

      // Remove transaction from UI (optimistic update already done)
      toast.success("Transaksi berhasil dihapus", {
        description: "Data telah dihapus dari dashboard",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error("Gagal menghapus transaksi", {
        description: errorMessage,
      });
      // Rollback: restore the transaction
      if (deletedTransaction) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            recentTransactions: [
              deletedTransaction,
              ...prev.recentTransactions.filter((t) => t.id !== deletedTransaction.id),
            ].slice(0, 10),
          };
        });
      }
    } finally {
      setIsDeleting(false);
      setTransactionToDelete(null);
    }
  }, [deletedTransaction]);

  const initiateDelete = useCallback((transaction: typeof transactionToDelete) => {
    setTransactionToDelete(transaction);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!transactionToDelete) return;

    // Optimistic update: remove from UI immediately
    setDeletedTransaction(transactionToDelete);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        recentTransactions: prev.recentTransactions.filter((t) => t.id !== transactionToDelete.id),
      };
    });

    // Show toast with undo option
    const toastId = toast.loading("Menghapus transaksi...", {
      description: "Klik undo untuk membatalkan",
    });

    // Auto-delete after 5 seconds if no undo
    const timeout = setTimeout(() => {
      if (transactionToDelete) {
        handleDeleteTransaction(transactionToDelete.id);
        toast.dismiss(toastId);
      }
    }, 5000);

    setUndoTimeout(timeout);

    // Store the toast ID and timeout for undo
    const win = window as Window & { __deleteToastId?: string | number; __deleteTimeout?: ReturnType<typeof setTimeout> };
    win.__deleteToastId = toastId;
    win.__deleteTimeout = timeout;
  }, [transactionToDelete, handleDeleteTransaction]);

  const handleUndoDelete = useCallback(() => {
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      setUndoTimeout(null);
    }

    const win = window as Window & { __deleteToastId?: string | number | null; __deleteTimeout?: ReturnType<typeof setTimeout> | null };
    const toastId = win.__deleteToastId;
    const timeout = win.__deleteTimeout;

    if (timeout) {
      clearTimeout(timeout);
      win.__deleteTimeout = null;
    }

    if (toastId) {
      toast.dismiss(toastId);
      win.__deleteToastId = null;
    }

    // Restore the transaction
    if (deletedTransaction) {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentTransactions: [
            deletedTransaction,
            ...prev.recentTransactions.filter((t) => t.id !== deletedTransaction.id),
          ].slice(0, 10),
        };
      });

      toast.success("Penghapusan dibatalkan", {
        description: "Transaksi telah dipulihkan",
        duration: 3000,
      });

      setDeletedTransaction(null);
    }

    setTransactionToDelete(null);
  }, [deletedTransaction, undoTimeout]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (data) {
      console.log("=== DASHBOARD DATA ===");
      console.log("Total Income:", data.totalIncome);
      console.log("Total Expense:", data.totalExpense);
      console.log("Transactions count:", data.recentTransactions?.length);
      console.log("====================");
    }
  }, [data]);

  const savingsRate = data && data.totalIncome > 0 
    ? ((data.totalSavings / data.totalIncome) * 100).toFixed(1) 
    : "0";

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
              onClick={() => router.push("/dashboard")}
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Dashboard Keuangan</h1>
            <p className="text-sm text-gray-500">Analisis dan statistik keuangan Anda</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] bg-gray-900 border-white/10">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 Bulan</SelectItem>
                <SelectItem value="3m">3 Bulan</SelectItem>
                <SelectItem value="6m">6 Bulan</SelectItem>
                <SelectItem value="1y">1 Tahun</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-white/5"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <SignedIn>
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Memuat data keuangan...</p>
            </div>
          )}

          {error && (
            <Card className="bg-gray-900 border-white/5 rounded-2xl p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Gagal Memuat Data</h3>
                <p className="text-gray-400 text-sm mb-4 max-w-md">{error}</p>
                <Button onClick={fetchDashboardData} className="bg-emerald-600 hover:bg-emerald-500">
                  Coba Lagi
                </Button>
              </div>
            </Card>
          )}

          {data && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="bg-gray-900 border-white/5 rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Saldo</CardTitle>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(data.totalBalance)}</div>
                    <p className="text-xs text-gray-500">Pemasukan - Pengeluaran</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-white/5 rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Pemasukan</CardTitle>
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-teal-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white mb-1">{formatCompactCurrency(data.totalIncome)}</div>
                    <p className="text-xs text-gray-500">Total pemasukan periode ini</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-white/5 rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Pengeluaran</CardTitle>
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white mb-1">{formatCompactCurrency(data.totalExpense)}</div>
                    <p className="text-xs text-gray-500">Total pengeluaran periode ini</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-white/5 rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Tabungan</CardTitle>
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <PiggyBank className="w-4 h-4 text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white mb-1">{formatCompactCurrency(data.totalSavings)}</div>
                    <p className="text-xs text-blue-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {savingsRate}% dari pemasukan
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <Tabs defaultValue="overview" className="mb-8">
                <TabsList className="bg-gray-900 border border-white/5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="income">Pemasukan</TabsTrigger>
                  <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                  <TabsTrigger value="savings">Tabungan</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="bg-gray-900 border-white/5 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-emerald-400" />
                          Pemasukan vs Pengeluaran
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.incomeExpenseTrend}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="month" stroke="#9ca3af" />
                              <YAxis stroke="#9ca3af" tickFormatter={(value) => value >= 1000000 ? `Rp${value / 1000000}Jt` : `${value / 1000}rb`} />
                              <Tooltip
                                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                                formatter={(value: number) => [formatCurrency(value), ""]}
                              />
                              <Legend />
                              <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-white/5 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                          <ChartPieIcon className="w-5 h-5 text-blue-400" />
                          Kategori Pengeluaran
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {data.categoryBreakdown.length > 0 ? (
                          <>
                            <div className="h-[300px] flex items-center justify-center">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={data.categoryBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                  >
                                    {data.categoryBreakdown.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                                    formatter={(value: number) => [formatCurrency(value), ""]}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap justify-center gap-3 mt-4">
                              {data.categoryBreakdown.slice(0, 6).map((cat, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                  <span className="text-xs text-gray-400">{cat.name}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="h-[300px] flex items-center justify-center text-gray-500">
                            Belum ada data pengeluaran
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="income" className="mt-4">
                  <Card className="bg-gray-900 border-white/5 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-white">Trend Pemasukan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.incomeExpenseTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" tickFormatter={(value) => value >= 1000000 ? `Rp${value / 1000000}Jt` : `${value / 1000}rb`} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                              formatter={(value: number) => [formatCurrency(value), ""]}
                            />
                            <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="expense" className="mt-4">
                  <Card className="bg-gray-900 border-white/5 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-white">Trend Pengeluaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data.incomeExpenseTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" tickFormatter={(value) => value >= 1000000 ? `Rp${value / 1000000}Jt` : `${value / 1000}rb`} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                              formatter={(value: number) => [formatCurrency(value), ""]}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="savings" className="mt-4">
                  <Card className="bg-gray-900 border-white/5 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-white">Pertumbuhan Tabungan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.savingsTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" tickFormatter={(value) => value >= 1000000 ? `Rp${value / 1000000}Jt` : `${value / 1000}rb`} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                              formatter={(value: number) => [formatCurrency(value), ""]}
                            />
                            <Area type="monotone" dataKey="savings" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Recent Transactions */}
              <Card className="bg-gray-900 border-white/5 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
                    <span>Transaksi Terakhir</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/dashboard/transactions")}
                      className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    >
                      Lihat Semua
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.recentTransactions.slice(0, 6).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              transaction.type === "income"
                                ? "bg-emerald-500/10 border border-emerald-500/20"
                                : "bg-red-500/10 border border-red-500/20"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <TrendingUp className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{transaction.category} • {transaction.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-semibold ${
                              transaction.type === "income" ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => initiateDelete(transaction)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                            title="Hapus transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Undo Toast */}
                  {deletedTransaction && (
                    <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm text-emerald-400">
                          Transaksi dihapus • Klik undo untuk membatalkan
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUndoDelete}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 h-8 px-3 text-xs"
                      >
                        Undo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </SignedIn>

        <SignedOut>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Wallet className="w-8 h-8" />
            </div>
            <p className="text-lg font-semibold text-white mb-2">Masuk untuk melihat dashboard</p>
            <p className="text-sm text-gray-500 mb-6">Login untuk melihat statistik dan analisis keuangan Anda</p>
            <SignInButton>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 rounded-xl font-medium">
                Masuk Sekarang
              </Button>
            </SignInButton>
          </div>
        </SignedOut>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-gray-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-1.5 rounded-lg">
              <Wallet className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold">Asisten <span className="text-emerald-400">Keuangan</span></span>
          </div>
          <p className="text-[11px] text-gray-600">© 2026 Asisten Keuangan. Semua hak dilindungi.</p>
        </div>
      </footer>

      {/* Delete Confirmation Dialog */}
      <TransactionDeleteDialog
        transaction={transactionToDelete}
        open={!!transactionToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setTransactionToDelete(null);
          }
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

function ChartPieIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  );
}
