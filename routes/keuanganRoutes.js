const express = require('express');
const router = express.Router();
const Keuangan = require('../models/Keuangan');
const { protectAdmin } = require('../middleware/authMiddleware');

// 1. Tampilkan semua data keuangan untuk admin (dengan proteksi)
router.get('/admin/keuangan', protectAdmin, async (req, res) => {
    try {
        const keuanganList = await Keuangan.find().sort({ tanggal: -1 });

        // Hitung total pemasukan dan pengeluaran
        const totalPemasukan = await Keuangan.aggregate([
            { $match: { jenis: 'pemasukan' } },
            { $group: { _id: null, total: { $sum: '$nominal' } } }
        ]);

        const totalPengeluaran = await Keuangan.aggregate([
            { $match: { jenis: 'pengeluaran' } },
            { $group: { _id: null, total: { $sum: '$nominal' } } }
        ]);

        const saldo = (totalPemasukan[0]?.total || 0) - (totalPengeluaran[0]?.total || 0);

        res.render('admin/keuangan-list', {
            keuangan: keuanganList,
            totalPemasukan: totalPemasukan[0]?.total || 0,
            totalPengeluaran: totalPengeluaran[0]?.total || 0,
            saldo: saldo,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error mengambil data keuangan');
    }
});

// 2. Tampilkan form tambah keuangan baru
router.get('/admin/keuangan/tambah', protectAdmin, (req, res) => {
    res.render('admin/keuangan-form', {
        keuangan: null,
        action: 'Tambah',
        user: req.user
    });
});

// 3. Proses simpan keuangan baru (POST)
router.post('/admin/keuangan', protectAdmin, async (req, res) => {
    try {
        const { tanggal, jenis, nominal, keterangan, kategori } = req.body;

        const keuanganBaru = new Keuangan({
            tanggal: tanggal || Date.now(),
            jenis,
            nominal,
            keterangan,
            kategori,
            author: req.user.id
        });

        await keuanganBaru.save();
        res.redirect('/admin/keuangan');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error menyimpan data keuangan');
    }
});

// 4. Tampilkan form edit keuangan
router.get('/admin/keuangan/edit/:id', protectAdmin, async (req, res) => {
    try {
        const keuangan = await Keuangan.findById(req.params.id);
        if (!keuangan) {
            return res.status(404).send('Data keuangan tidak ditemukan');
        }

        res.render('admin/keuangan-form', {
            keuangan,
            action: 'Edit',
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error mengambil data keuangan');
    }
});

// 5. Proses update keuangan (PUT)
router.post('/admin/keuangan/:id', protectAdmin, async (req, res) => {
    try {
        const { tanggal, jenis, nominal, keterangan, kategori } = req.body;

        await Keuangan.findByIdAndUpdate(req.params.id, {
            tanggal,
            jenis,
            nominal,
            keterangan,
            kategori
        });

        res.redirect('/admin/keuangan');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error mengupdate data keuangan');
    }
});

// 6. Proses hapus keuangan (DELETE)
router.post('/admin/keuangan/hapus/:id', protectAdmin, async (req, res) => {
    try {
        await Keuangan.findByIdAndDelete(req.params.id);
        res.redirect('/admin/keuangan');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error menghapus data keuangan');
    }
});

// 7. Tampilkan laporan keuangan untuk halaman publik (tanpa proteksi)
router.get('/keuangan', async (req, res) => {
    try {
        const keuanganList = await Keuangan.find().sort({ tanggal: -1 }).limit(50);

        const totalPemasukan = await Keuangan.aggregate([
            { $match: { jenis: 'pemasukan' } },
            { $group: { _id: null, total: { $sum: '$nominal' } } }
        ]);

        const totalPengeluaran = await Keuangan.aggregate([
            { $match: { jenis: 'pengeluaran' } },
            { $group: { _id: null, total: { $sum: '$nominal' } } }
        ]);

        const saldo = (totalPemasukan[0]?.total || 0) - (totalPengeluaran[0]?.total || 0);

        res.render('public/keuangan', {
            keuangan: keuanganList,
            totalPemasukan: totalPemasukan[0]?.total || 0,
            totalPengeluaran: totalPengeluaran[0]?.total || 0,
            saldo: saldo,
            currentPath: '/keuangan' // <-- TAMBAHKAN INI
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error mengambil data keuangan');
    }
});

module.exports = router;