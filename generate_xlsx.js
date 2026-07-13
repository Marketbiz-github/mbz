const XLSX = require('xlsx');

// Create a new workbook
const wb = XLSX.utils.book_new();

// Data with just Nama and Nomor WA, plus one optional dynamic column
const data = [
  { 
    nama: "Budi Santoso", 
    phone_number: "081234567890",
    status: "sent",
    tanggal: "2026-07-13 10:00",
    kota: "Jakarta", 
    tagihan: "150000" 
  },
  { 
    nama: "Siti Aminah", 
    phone_number: "089876543210",
    status: "pending",
    tanggal: "",
    kota: "Surabaya", 
    tagihan: "200000" 
  }
];

// Convert data to worksheet
const ws = XLSX.utils.json_to_sheet(data);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, "Kontak WA");

// Write to file
XLSX.writeFile(wb, "./public/wa_blast_template.xlsx");
console.log("wa_blast_template.xlsx generated successfully in public directory.");
