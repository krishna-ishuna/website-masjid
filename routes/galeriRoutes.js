const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protectAdmin } = require('../middleware/authMiddleware');
const { uploadGaleri, hapusFileGaleri } = require('../middleware/upload');

// 1. Tampilkan semua foto untuk admin
router.get('/admin/galeri', protectAdmin, async (req, res) => {
    try {
        const { kategori } = req.query;
        const filter = kategori ? { kategori } : {};
        const galeriList = await Gallery.find(filter).sort({ tanggal: -1 });

        res.render('admin/galeri-list', {
            galeri: galeriList,
            kategoriAktif: kategori || 'semua',
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error mengambil data galeri');
    }
});

// 2. Tampilkan form upload foto baru
router.get('/admin/galeri/tambah', protectAdmin, (req, res) => {
    res.render('admin/galeri-form', {
        galeri: null,
        action: 'Upload',
        user: req.user
    });
});

// 3. Proses upload foto (multiple)
router.post('/admin/galeri', protectAdmin, uploadGaleri.array('fotos[]', 20), async (req, res) => {
    try {
        // 🔍 DEBUG: Lihat apa yang diterima server
        console.log('=== DEBUG UPLOAD GALERI ===');
        console.log('req.files:', req.files);
        console.log('Jumlah file:', req.files ? req.files.length : 0);
        console.log('req.body:', req.body);
        console.log('===========================');

        const { judul, deskripsi, kategori } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).send('Tidak ada file yang di-upload!');
        }

        // Simpan setiap foto ke database
        const promises = req.files.map(file => {
            const fotoBaru = new Gallery({
                judul: judul || 'Foto Kegiatan',
                deskripsi: deskripsi || '',
                kategori,
                filename: file.filename,
                author: req.user.id
            });
            return fotoBaru.save();
        });

        await Promise.all(promises);
        res.redirect('/admin/galeri');
    } catch (error) {
        console.error(error);
        if (req.files) {
            req.files.forEach(file => hapusFileGaleri(file.filename));
        }
        res.status(500).send('Error upload foto: ' + error.message);
    }
});

// 4. Tampilkan form edit foto
router.get('/admin/galeri/edit/:id', protectAdmin, async (req, res) => {
    try {
        const galeri = await Gallery.findById(req.params.id);
        if (!galeri) return res.status(404).send('Foto tidak ditemukan');

        res.render('admin/galeri-form', {
            galeri,
            action: 'Edit',
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error mengambil data');
    }
});

// 5. Proses update info foto (tanpa ganti file)
router.post('/admin/galeri/:id', protectAdmin, async (req, res) => {
    try {
        const { judul, deskripsi, kategori } = req.body;
        await Gallery.findByIdAndUpdate(req.params.id, { judul, deskripsi, kategori });
        res.redirect('/admin/galeri');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error update foto');
    }
});

// 6. Proses hapus foto
router.post('/admin/galeri/hapus/:id', protectAdmin, async (req, res) => {
    try {
        const galeri = await Gallery.findById(req.params.id);
        if (!galeri) return res.status(404).send('Foto tidak ditemukan');

        hapusFileGaleri(galeri.filename);
        await Gallery.findByIdAndDelete(req.params.id);
        res.redirect('/admin/galeri');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error hapus foto');
    }
});

// 7. Halaman publik galeri
router.get('/galeri', async (req, res) => {
    try {
        const { kategori } = req.query;
        const filter = kategori ? { kategori } : {};
        const galeriList = await Gallery.find(filter).sort({ tanggal: -1 });

        res.render('public/galeri', {
            galeri: galeriList,
            kategoriAktif: kategori || 'semua',
            currentPath: '/galeri' // <-- TAMBAHKAN INI
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error mengambil data galeri');
    }
});

module.exports = router;