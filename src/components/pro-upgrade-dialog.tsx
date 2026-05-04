"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
  description?: string;
}

export function ProUpgradeDialog({ 
  open, 
  onOpenChange, 
  featureName = "fitur ini",
  description = "Upgrade ke Pro untuk mendapatkan akses tanpa batas dan fitur eksklusif lainnya."
}: ProUpgradeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat tagihan");
      }

      // Redirect ke halaman pembayaran Xendit
      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
      }
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error("Checkout Gagal", { description: errMessage });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Cegah tutup dialog saat sedang loading
      if (!isLoading) onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Upgrade ke Tier Pro</DialogTitle>
          <DialogDescription className="text-center">
            Anda memerlukan akses Pro untuk menggunakan <strong>{featureName}</strong>. {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
            <h4 className="font-semibold mb-2">Keuntungan Tier Pro:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Transaksi <strong>Unlimited</strong> (Tidak terbatas)</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Export Laporan ke CSV, Excel & PDF</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Prioritas Dukungan Pelanggan</span>
              </li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            className="w-full" 
            onClick={handleUpgrade}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyiapkan Pembayaran...
              </>
            ) : (
              "Upgrade Sekarang - Rp 29.000/bln"
            )}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Mungkin Nanti
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
