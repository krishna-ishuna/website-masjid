const express = require('express');
const router = express.Router();
const Kontak = require('../models/Kontak');
const Donasi = require('../models/Donasi');
const { protectAdmin } = require('../middleware/authMiddleware');

// ==================== HALAMAN PUBLIK ====================

// 1. Tampilkan halaman kontak & donasi
router.get('/kontak', (req, res) => {
    res.render('public/kontak', {
        title: 'Kontak & Donasi - Masjid Al-Ikhlas',
        success: req.query.success || null,
        error: null,
        currentPath: '/kontak' // <-- TAMBAHKAN INI
    });
});

// 2. Proses kirim pesan kontak
router.post('/kontak/pesan', async (req, res) => {
    try {
        const { nama, email, telepon, subjek, pesan } = req.body;

        const pesanBaru = new Kontak({
            nama,
            email: email || undefined,
            telepon: telepon || undefined,
            subjek,
            pesan
        });

        await pesanBaru.save();
        res.redirect('/kontak?success=pesan');
    } catch (error) {
        console.error(error);
        res.status(500).send('Gagal mengirim pesan: ' + error.message);
    }
});

// 3. Proses pengajuan donasi
router.post('/kontak/donasi', async (req, res) => {
    try {
        const { namaDonatur, email, telepon, nominal, kategori, metode, keterangan } = req.body;

        const donasiBaru = new Donasi({
            namaDonatur,
            email: email || undefined,
            telepon,
            nominal,
            kategori,
            metode,
            keterangan: keterangan || ''
        });

        await donasiBaru.save();
        res.redirect('/kontak?success=donasi');
    } catch (error) {
        console.error(error);
        res.status(500).send('Gagal mengirim pengajuan: ' + error.message);
    }
});

// ==================== HALAMAN ADMIN - KONTAK ====================

// 4. List semua pesan kontak
router.get('/admin/kontak', protectAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const pesanList = await Kontak.find(filter).sort({ createdAt: -1 });

        // Hitung jumlah pesan baru
        const pesanBaru = await Kontak.countDocuments({ status: 'baru' });

        res.render('admin/kontak-list', {
            pesan: pesanList,
            statusAktif: status || 'semua',
            pesanBaru,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error mengambil data');
    }
});

// 5. Detail pesan kontak
router.get('/admin/kontak/:id', protectAdmin, async (req, res) => {
    try {
        const pesan = await Kontak.findById(req.params.id);
        if (!pesan) return res.status(404).send('Pesan tidak ditemukan');

        // Update status jadi 'dibaca'
        if (pesan.status === 'baru') {
            pesan.status = 'dibaca';
            await pesan.save();
        }

        res.render('admin/kontak-detail', {
            pesan,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

// 6. Update status pesan
router.post('/admin/kontak/:id/status', protectAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        await Kontak.findByIdAndUpdate(req.params.id, { status });
        res.redirect('/admin/kontak');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

// 7. Hapus pesan
router.post('/admin/kontak/hapus/:id', protectAdmin, async (req, res) => {
    try {
        await Kontak.findByIdAndDelete(req.params.id);
        res.redirect('/admin/kontak');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

// ==================== HALAMAN ADMIN - DONASI ====================

// 8. List semua pengajuan donasi
router.get('/admin/donasi', protectAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const donasiList = await Donasi.find(filter)
            .sort({ createdAt: -1 })
            .populate('verifiedBy', 'username');

        // Hitung statistik
        const menunggu = await Donasi.countDocuments({ status: 'menunggu' });
        const totalTerverifikasi = await Donasi.aggregate([
            { $match: { status: 'diverifikasi' } },
            { $group: { _id: null, total: { $sum: '$nominal' } } }
        ]);

        res.render('admin/donasi-list', {
            donasi: donasiList,
            statusAktif: status || 'semua',
            menunggu,
            totalTerverifikasi: totalTerverifikasi[0]?.total || 0,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

// 9. Detail pengajuan donasi
router.get('/admin/donasi/:id', protectAdmin, async (req, res) => {
    try {
        const donasi = await Donasi.findById(req.params.id).populate('verifiedBy', 'username');
        if (!donasi) return res.status(404).send('Data tidak ditemukan');

        res.render('admin/donasi-detail', {
            donasi,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

// 10. Verifikasi/Tolak donasi
router.post('/admin/donasi/:id/verifikasi', protectAdmin, async (req, res) => {
    try {
        const { status, catatanAdmin } = req.body;

        const updateData = {
            status,
            catatanAdmin: catatanAdmin || '',
            verifiedBy: req.user.id
        };

        if (status === 'diverifikasi') {
            updateData.tanggalVerifikasi = new Date();
        }

        await Donasi.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/donasi');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

// 11. Hapus pengajuan donasi
router.post('/admin/donasi/hapus/:id', protectAdmin, async (req, res) => {
    try {
        await Donasi.findByIdAndDelete(req.params.id);
        res.redirect('/admin/donasi');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

module.exports = router;