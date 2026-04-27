import { Transaction } from "@/types/database";

/**
 * Format currency to Indonesian Rupiah
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * Format date to Indonesian locale
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date for filename (YYYY-MM-DD)
 */
export const formatDateForFilename = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Generate CSV content from transactions
 */
export const generateCSV = (transactions: Transaction[]): string => {
  const headers = ["Tanggal", "Tipe", "Kategori", "Jumlah", "Deskripsi"];
  
  const rows = transactions.map((t) => [
    formatDate(t.date),
    t.type === "income" ? "Pemasukan" : "Pengeluaran",
    t.category,
    formatCurrency(t.amount).replace(/Rp\s?/g, ""),
    t.description || "-",
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma
          const escaped = cell.replace(/"/g, '""');
          return escaped.includes(",") ? `"${escaped}"` : escaped;
        })
        .join(",")
    ),
  ].join("\n");
  
  return csvContent;
};

/**
 * Generate Excel file using exceljs
 */
export const generateExcel = async (transactions: Transaction[]): Promise<Buffer> => {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: All Transactions
  const transactionsSheet = workbook.addWorksheet("Transaksi");
  
  // Style header
  transactionsSheet.columns = [
    { header: "Tanggal", key: "date", width: 15 },
    { header: "Tipe", key: "type", width: 12 },
    { header: "Kategori", key: "category", width: 15 },
    { header: "Jumlah", key: "amount", width: 18 },
    { header: "Deskripsi", key: "description", width: 30 },
  ];
  
  // Header styling
  const headerRow = transactionsSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF10B981" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  
  // Add data
  transactions.forEach((t) => {
    const row = transactionsSheet.addRow({
      date: formatDate(t.date),
      type: t.type === "income" ? "Pemasukan" : "Pengeluaran",
      category: t.category,
      amount: formatCurrency(t.amount),
      description: t.description || "-",
    });
    
    // Color code by type
    if (t.type === "income") {
      row.getCell(2).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF10B981" },
      };
      row.getCell(2).font = { color: { argb: "FFFFFFFF" } };
    } else {
      row.getCell(2).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEF4444" },
      };
      row.getCell(2).font = { color: { argb: "FFFFFFFF" } };
    }
  });
  
  // Freeze header row
  transactionsSheet.views = [{ state: "frozen", ySplit: 1 }];
  
  // Sheet 2: Summary by Category
  const summarySheet = workbook.addWorksheet("Ringkasan Kategori");
  
  const categoryData: Record<string, { income: number; expense: number }> = {};
  
  transactions.forEach((t) => {
    if (!categoryData[t.category]) {
      categoryData[t.category] = { income: 0, expense: 0 };
    }
    if (t.type === "income") {
      categoryData[t.category].income += t.amount;
    } else {
      categoryData[t.category].expense += t.amount;
    }
  });
  
  summarySheet.columns = [
    { header: "Kategori", key: "category", width: 20 },
    { header: "Pemasukan", key: "income", width: 18 },
    { header: "Pengeluaran", key: "expense", width: 18 },
    { header: "Net", key: "net", width: 18 },
  ];
  
  const summaryHeader = summarySheet.getRow(1);
  summaryHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  summaryHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3B82F6" },
  };
  summaryHeader.alignment = { vertical: "middle", horizontal: "center" };
  
  Object.entries(categoryData).forEach(([category, data]) => {
    summarySheet.addRow({
      category,
      income: formatCurrency(data.income),
      expense: formatCurrency(data.expense),
      net: formatCurrency(data.income - data.expense),
    });
  });
  
  summarySheet.views = [{ state: "frozen", ySplit: 1 }];
  
  // Sheet 3: Monthly Trends
  const trendsSheet = workbook.addWorksheet("Trend Bulanan");
  
  const monthlyData: Record<string, { income: number; expense: number }> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  transactions.forEach((t) => {
    const date = new Date(t.date);
    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }
    
    if (t.type === "income") {
      monthlyData[monthKey].income += t.amount;
    } else {
      monthlyData[monthKey].expense += t.amount;
    }
  });
  
  trendsSheet.columns = [
    { header: "Bulan", key: "month", width: 15 },
    { header: "Pemasukan", key: "income", width: 18 },
    { header: "Pengeluaran", key: "expense", width: 18 },
    { header: "Saldo", key: "balance", width: 18 },
  ];
  
  const trendsHeader = trendsSheet.getRow(1);
  trendsHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  trendsHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF8B5CF6" },
  };
  trendsHeader.alignment = { vertical: "middle", horizontal: "center" };
  
  Object.entries(monthlyData).forEach(([month, data]) => {
    trendsSheet.addRow({
      month,
      income: formatCurrency(data.income),
      expense: formatCurrency(data.expense),
      balance: formatCurrency(data.income - data.expense),
    });
  });
  
  trendsSheet.views = [{ state: "frozen", ySplit: 1 }];
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

/**
 * Generate PDF report
 */
export const generatePDF = async (
  transactions: Transaction[],
  startDate?: string,
  endDate?: string
): Promise<Buffer> => {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  
  const doc = new jsPDF();
  
  // Calculate summary
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalBalance = totalIncome - totalExpense;
  
  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Laporan Keuangan", 14, 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  
  // Date range
  const periodText = startDate && endDate
    ? `Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`
    : "Semua Transaksi";
  doc.text(periodText, 14, 28);
  
  // Generated date
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Dibuat: ${new Date().toLocaleDateString("id-ID")}`, 14, 34);
  
  // Summary boxes
  let yPos = 45;
  
  // Pemasukan box
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(14, yPos, 60, 20, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Pemasukan", 44, yPos + 7, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(formatCurrency(totalIncome), 44, yPos + 14, { align: "center" });
  
  // Pengeluaran box
  doc.setFillColor(239, 68, 68);
  doc.roundedRect(84, yPos, 60, 20, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Pengeluaran", 114, yPos + 7, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(formatCurrency(totalExpense), 114, yPos + 14, { align: "center" });
  
  // Saldo box
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(154, yPos, 42, 20, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Saldo", 175, yPos + 7, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(formatCurrency(totalBalance), 175, yPos + 14, { align: "center" });
  
  // Transaction table
  yPos += 32;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Riwayat Transaksi", 14, yPos);
  
  const tableData = transactions.map((t) => [
    formatDate(t.date),
    t.type === "income" ? "Pemasukan" : "Pengeluaran",
    t.category,
    formatCurrency(t.amount),
    t.description || "-",
  ]);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [["Tanggal", "Tipe", "Kategori", "Jumlah", "Deskripsi"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 22, halign: "center" },
      2: { cellWidth: 25 },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: "auto" },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: yPos + 5, left: 14, right: 14 },
  });
  
  // Add footer with page numbers
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150);
  
  const pageCount = doc.internal.pages.length - 1; // Subtract 1 because index 0 is not used
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }
  
  // Add footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.text("Asisten Keuangan - Generated by Asisten Keuangan App", 14, doc.internal.pageSize.getHeight() - 20);
  }
  
  // Generate buffer
  const pdfBuffer = doc.output("arraybuffer");
  return Buffer.from(pdfBuffer);
};

/**
 * Calculate summary data for export
 */
export const calculateSummary = (transactions: Transaction[]) => {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalBalance = totalIncome - totalExpense;
  
  const categoryData: Record<string, { income: number; expense: number }> = {};
  
  transactions.forEach((t) => {
    if (!categoryData[t.category]) {
      categoryData[t.category] = { income: 0, expense: 0 };
    }
    if (t.type === "income") {
      categoryData[t.category].income += t.amount;
    } else {
      categoryData[t.category].expense += t.amount;
    }
  });
  
  return {
    totalIncome,
    totalExpense,
    totalBalance,
    categoryData,
    transactionCount: transactions.length,
  };
};
