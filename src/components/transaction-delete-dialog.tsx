"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle } from "lucide-react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface TransactionDeleteDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export function TransactionDeleteDialog({
  transaction,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: TransactionDeleteDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  if (!transaction) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-900 border-white/10">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold text-white">
              Hapus Transaksi?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-400">
            <div className="mb-4">
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Kategori</span>
                <span className="text-white text-sm font-medium">{transaction.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Deskripsi</span>
                <span className="text-white text-sm font-medium">{transaction.description}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Tanggal</span>
                <span className="text-white text-sm font-medium">{transaction.date}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-gray-500 text-sm">Jumlah</span>
                <span className={`text-sm font-bold ${
                  transaction.type === "income" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                </span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-800 border-white/10 hover:bg-gray-700 text-gray-300">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-500 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Ya, Hapus
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
