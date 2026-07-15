require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // <-- TAMBAHKAN INI
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // <-- AKTIFKAN COOKIE PARSER
app.use(express.static(path.join(__dirname, 'public')));

// Set View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });

// Routes
const Pengumuman = require('./models/Pengumuman');
const Keuangan = require('./models/Keuangan');
const Gallery = require('./models/Gallery');

app.get('/', async (req, res) => {
    try {
        const pengumumanTerbaru = await Pengumuman.find().sort({ tanggal: -1 }).limit(3);

        const totalPemasukan = await Keuangan.aggregate([
            { $match: { jenis: 'pemasukan' } },
            { $group: { _id: null, total: { $sum: '$nominal' } } }
        ]);

        const totalPengeluaran = await Keuangan.aggregate([
            { $match: { jenis: 'pengeluaran' } },
            { $group: { _id: null, total: { $sum: '$nominal' } } }
        ]);

        const saldo = (totalPemasukan[0]?.total || 0) - (totalPengeluaran[0]?.total || 0);

        res.render('public/index', {
            pengumumanTerbaru,
            saldo,
            title: 'Beranda - Masjid Al-Ikhlas',
            currentPath: '/' // <-- TAMBAHKAN INI
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
});

// Route Jadwal Sholat
app.get('/jadwal', (req, res) => {
    res.render('public/jadwal', {
        title: 'Jadwal Sholat - Masjid Al-Ikhlas',
        currentPath: '/jadwal' // <-- TAMBAHKAN INI
    });
});

// API untuk galeri terbaru di beranda
app.get('/api/galeri-terbaru', async (req, res) => {
    try {
        const galeri = await Gallery.find().sort({ tanggal: -1 }).limit(4);
        res.json(galeri);
    } catch (error) {
        res.status(500).json({ error: 'Error mengambil data' });
    }
});

// Route Admin (Semua route di dalam file ini akan diawali /admin)
app.use('/admin', require('./routes/adminRoutes'));
app.use('/', require('./routes/pengumumanRoutes'));
app.use('/', require('./routes/keuanganRoutes'));
app.use('/', require('./routes/galeriRoutes'));
app.use('/', require('./routes/kontakRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));