Aplikasi Coffee Roaster
Aplikasi modern berbasis React untuk para penggemar roasting kopi yang ingin melacak, menganalisis, dan menyempurnakan profil roasting mereka.
Fitur

Manajemen Profil Roast - Membuat, menyimpan, dan mengelola profil roasting khusus
Monitoring Real-time - Melacak kurva suhu dan perkembangan roasting
Visualisasi Data - Grafik interaktif yang menampilkan perkembangan roast
Timer & Alarm - Timer roasting bawaan dengan notifikasi yang dapat disesuaikan
Pencatatan Roast - Menyimpan catatan detail dari setiap sesi roasting
Manajemen Resep - Menyimpan dan mereplikasi resep roast yang berhasil
Desain Responsif - Berfungsi dengan sempurna di desktop dan perangkat mobile

Tech Stack

Frontend: React 18 dengan Vite
Build Tool: Vite dengan Hot Module Replacement (HMR)
Linting: ESLint dengan aturan yang direkomendasikan
Styling: [Tambahkan solusi styling Anda - CSS Modules, Tailwind, dll.]
Charts: [Tambahkan library charting jika digunakan - Chart.js, D3, Recharts, dll.]

Memulai
Prasyarat

Node.js (versi 16 atau lebih tinggi)
npm atau yarn package manager

Instalasi

Clone repository

bash   git clone https://github.com/mackeyaddict/coffee-roaster-app.git
   cd coffee-roaster-app

Install dependencies

bash   npm install
   # atau
   yarn install

Jalankan development server

bash   npm run dev
   # atau
   yarn dev

Buka browser
Navigasi ke http://localhost:5173 untuk melihat aplikasi

Build untuk Production
bashnpm run build
# atau
yarn build
File hasil build akan berada di direktori dist, siap untuk deployment.
Linting
bashnpm run lint
# atau
yarn lint
Cara Penggunaan
Membuat Profil Roast

Klik "Roast Baru" untuk memulai sesi roasting baru
Atur target kurva suhu dan waktu
Monitor data suhu real-time selama proses roast
Simpan profil untuk referensi di masa depan

Mengelola Data Roast

Lihat riwayat roasting Anda di bagian "Log Roast"
Bandingkan profil roast yang berbeda secara bersamaan
Export data untuk analisis di tools eksternal

Kustomisasi Pengaturan
Akses panel pengaturan untuk:

Konfigurasi satuan suhu (Celsius/Fahrenheit)
Mengatur preferensi alarm
Kustomisasi opsi tampilan grafik

Kompatibilitas Hardware
Aplikasi ini dirancang untuk bekerja dengan:

Input data manual untuk semua jenis peralatan roasting
[Tambahkan integrasi hardware spesifik jika ada]
Kapabilitas integrasi termometer/thermocouple

Berkontribusi
Kami menyambut kontribusi! Silakan kirimkan Pull Request. Untuk perubahan besar, harap buka issue terlebih dahulu untuk mendiskusikan perubahan yang ingin dilakukan.
Setup Development

Fork repository
Buat feature branch (git checkout -b feature/FiturKeren)
Buat perubahan Anda
Jalankan test dan linting
Commit perubahan (git commit -m 'Tambah FiturKeren')
Push ke branch (git push origin feature/FiturKeren)
Buka Pull Request

Script yang Tersedia
Di direktori project, Anda dapat menjalankan:

npm run dev - Menjalankan app dalam mode development
npm run build - Build app untuk production
npm run lint - Menjalankan linter
npm run preview - Preview built app secara lokal
