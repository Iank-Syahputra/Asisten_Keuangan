"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Pencil, Loader2 } from "lucide-react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface TransactionEditDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<Transaction, "id">) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORIES = {
  income: ["Gaji", "Freelance", "Investasi", "Bonus", "Hadiah", "Lainnya"],
  expense: ["Makanan", "Transportasi", "Belanja", "Hiburan", "Tagihan", "Kesehatan", "Pendidikan", "Lainnya"],
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const parseCurrency = (value: string): number => {
  return parseInt(value.replace(/[^0-9]/g, "")) || 0;
};

export function TransactionEditDialog({
  transaction,
  open,
  onOpenChange,
  onSave,
  isLoading = false,
}: TransactionEditDialogProps) {
  const [formData, setFormData] = useState<Omit<Transaction, "id">>({
    type: "expense",
    category: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const categories = CATEGORIES[formData.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-white/10 max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-emerald-400" />
            </div>
            <DialogTitle className="text-lg font-semibold text-white">
              {transaction?.id ? "Edit Transaksi" : "Tambah Transaksi"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            {transaction?.id ? "Ubah data transaksi di bawah ini" : "Isi data transaksi baru di bawah ini"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-300">
                Jenis Transaksi
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "income" | "expense") =>
                  setFormData({ ...formData, type: value, category: "" })
                }
              >
                <SelectTrigger className="bg-gray-800 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/10">
                  <SelectItem value="income" className="text-emerald-400">
                    💰 Pemasukan
                  </SelectItem>
                  <SelectItem value="expense" className="text-red-400">
                    💸 Pengeluaran
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-300">
                Jumlah
              </Label>
              <Input
                id="amount"
                type="text"
                value={formatCurrency(formData.amount).replace("Rp", "").trim()}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseCurrency(e.target.value) })
                }
                placeholder="Rp 0"
                className="bg-gray-800 border-white/10 text-white placeholder:text-gray-500"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300">
                Kategori
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-gray-800 border-white/10 text-white">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/10">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-white">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-gray-300">
                Tanggal
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-gray-800 border-white/10 text-white"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">
                Deskripsi (Opsional)
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Contoh: Belanja bulanan"
                className="bg-gray-800 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-gray-800 border-white/10 hover:bg-gray-700 text-gray-300"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  {transaction?.id ? "Update" : "Simpan"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
