const { Xendit } = require('xendit-node');

// Inisialisasi Xendit Client menggunakan key dari environment variable
// Jika tidak ada di env, Anda bisa langsung mengganti nilai string di bawah ini
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || 'xnd_production_xxxxxx'; 

const xenditClient = new Xendit({ secretKey: XENDIT_SECRET_KEY });
const invoiceService = xenditClient.Invoice;

async function checkInvoiceStatus() {
  // Ambil Invoice ID dari argumen command line
  const invoiceId = process.argv[2];

  if (!invoiceId) {
    console.error("❌ Error: Harap masukkan Invoice ID.");
    console.log("👉 Cara penggunaan: node check-invoice.js <YOUR_INVOICE_ID>");
    process.exit(1);
  }

  console.log(`Memeriksa status untuk Invoice ID: ${invoiceId}...`);
  
  try {
    const invoice = await invoiceService.getInvoiceById({ invoiceId: invoiceId });
    
    console.log('\n--- Hasil Pengecekan ---');
    console.log(`Status: ${invoice.status}`);
    console.log(`External ID: ${invoice.externalId}`);
    console.log(`Jumlah: Rp ${invoice.amount}`);
    console.log(`Metode Pembayaran: ${invoice.paymentMethod || 'Belum dibayar/Tidak tercatat'}`);
    console.log(`Tanggal Dibuat: ${new Date(invoice.created).toLocaleString()}`);
    if (invoice.paidAt) {
       console.log(`Tanggal Dibayar: ${new Date(invoice.paidAt).toLocaleString()}`);
    }
    
  } catch (error) {
    console.error('\n❌ Gagal mengambil data invoice!');
    if (error.response) {
      console.error(`Status HTTP: ${error.status}`);
      console.error('Pesan:', error.response);
    } else {
      console.error(error.message);
    }
  }
}

checkInvoiceStatus();
