"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, Bot, User, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  transaction?: Transaction | null;
}

export default function Chat() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengirim pesan");
      }

      const data = await response.json();
      const assistantMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: data.text,
        transaction: data.transaction?.success ? data.transaction.data : null,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">🤖 AI Chat</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Powered by Groq Llama 3 • Protected by Clerk Authentication
        </p>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 dark:text-red-300 text-sm">
              {error.message || "Terjadi kesalahan saat memproses permintaan"}
            </span>
          </div>
        </Card>
      )}

      <div className="space-y-4 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <Card className="p-6 text-center border-dashed">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mulai percakapan
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contoh: &quot;Saya beli makan siang 50 ribu&quot; atau &quot;Gaji masuk 5 juta&quot;
            </p>
          </Card>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="space-y-2">
              {/* Transaction Card */}
              {m.transaction && (
                <Card className="p-4 bg-emerald-500/10 border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-emerald-400">
                      Transaksi Berhasil Dicatat!
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Tipe:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {m.transaction.type === "income" ? (
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={m.transaction.type === "income" ? "text-emerald-400" : "text-red-400"}>
                          {m.transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Jumlah:</span>
                      <p className="font-semibold text-white mt-1">
                        {formatCurrency(m.transaction.amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Kategori:</span>
                      <p className="text-white mt-1">{m.transaction.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal:</span>
                      <p className="text-white mt-1">{m.transaction.date}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Deskripsi:</span>
                      <p className="text-white mt-1">{m.transaction.description}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Message Card */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {m.role === "user" ? (
                    <User className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-green-600" />
                  )}
                  <span className="font-semibold text-sm">
                    {m.role === "user" ? "Anda" : "Asisten AI"}
                  </span>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed pl-6">
                  {m.content}
                </div>
              </Card>
            </div>
          ))
        )}

        {isLoading && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-sm">Asisten AI</span>
            </div>
            <div className="pl-6">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex space-x-2"
      >
        <Input
          value={inputValue}
          placeholder="Contoh: Beli makan siang 50rb..."
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()}>
          {isLoading ? "Mengirim..." : "Kirim"}
        </Button>
      </form>
    </div>
  );
}
