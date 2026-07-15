const express = require('express');
const router = express.Router();
const Pengumuman = require('../models/Pengumuman');
const { protectAdmin } = require('../middleware/authMiddleware');
const { upload, hapusFileLama } = require('../middleware/upload');

// 1. Tampilkan semua pengumuman untuk admin
router.get('/admin/pengumuman', protectAdmin, async (req, res) => {
    try {
        const pengumumanList = await Pengumuman.find().sort({ tanggal: -1 });
        res.render('admin/pengumuman-list', {
            pengumuman: pengumumanList,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error mengambil data pengumuman');
    }
});

// 2. Tampilkan form tambah pengumuman baru
router.get('/admin/pengumuman/tambah', protectAdmin, (req, res) => {
    res.render('admin/pengumuman-form', {
        pengumuman: null,
        action: 'Tambah',
        user: req.user,
        error: null
    });
});

// 3. Proses simpan pengumuman baru (POST) - DENGAN UPLOAD GAMBAR
router.post('/admin/pengumuman', protectAdmin, upload.single('gambar'), async (req, res) => {
    try {
        const { judul, isi, kategori } = req.body;

        const pengumumanBaru = new Pengumuman({
            judul,
            isi,
            kategori,
            author: req.user.id,
            gambar: req.file ? req.file.filename : '' // Simpan nama file jika ada upload
        });

        await pengumumanBaru.save();
        res.redirect('/admin/pengumuman');
    } catch (error) {
        console.error(error);

        // Jika ada file ter-upload tapi error, hapus file tersebut
        if (req.file) {
            hapusFileLama(req.file.filename);
        }

        res.status(500).send('Error menyimpan pengumuman: ' + error.message);
    }
});

// 4. Tampilkan form edit pengumuman
router.get('/admin/pengumuman/edit/:id', protectAdmin, async (req, res) => {
    try {
        const pengumuman = await Pengumuman.findById(req.params.id);
        if (!pengumuman) {
            return res.status(404).send('Pengumuman tidak ditemukan');
        }

        res.render('admin/pengumuman-form', {
            pengumuman,
            action: 'Edit',
            user: req.user,
            error: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error mengambil data pengumuman');
    }
});

// 5. Proses update pengumuman (PUT) - DENGAN UPLOAD GAMBAR
router.post('/admin/pengumuman/:id', protectAdmin, upload.single('gambar'), async (req, res) => {
    try {
        const { judul, isi, kategori } = req.body;
        const pengumumanLama = await Pengumuman.findById(req.params.id);

        if (!pengumumanLama) {
            return res.status(404).send('Pengumuman tidak ditemukan');
        }

        // Siapkan data update
        const updateData = { judul, isi, kategori };

        // Jika ada gambar baru di-upload
        if (req.file) {
            // Hapus gambar lama jika ada
            if (pengumumanLama.gambar) {
                hapusFileLama(pengumumanLama.gambar);
            }
            // Simpan nama file baru
            updateData.gambar = req.file.filename;
        }

        await Pengumuman.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/pengumuman');
    } catch (error) {
        console.error(error);

        // Jika ada file ter-upload tapi error, hapus file tersebut
        if (req.file) {
            hapusFileLama(req.file.filename);
        }

        res.status(500).send('Error mengupdate pengumuman: ' + error.message);
    }
});

// 6. Proses hapus pengumuman (DELETE) - HAPUS JUGA FILE GAMBAR
router.post('/admin/pengumuman/hapus/:id', protectAdmin, async (req, res) => {
    try {
        const pengumuman = await Pengumuman.findById(req.params.id);

        if (!pengumuman) {
            return res.status(404).send('Pengumuman tidak ditemukan');
        }

        // Hapus file gambar jika ada
        if (pengumuman.gambar) {
            hapusFileLama(pengumuman.gambar);
        }

        await Pengumuman.findByIdAndDelete(req.params.id);
        res.redirect('/admin/pengumuman');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error menghapus pengumuman');
    }
});

// 7. Tampilkan pengumuman untuk halaman publik
router.get('/pengumuman', async (req, res) => {
    try {
        const pengumumanList = await Pengumuman.find().sort({ tanggal: -1 }).limit(10);
        res.render('public/pengumuman', {
            pengumuman: pengumumanList,
            currentPath: '/pengumuman' // <-- TAMBAHKAN INI
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error mengambil data pengumuman');
    }
});

// Error handler khusus untuk multer (ukuran file, tipe file)
router.use((error, req, res, next) => {
    if (error instanceof require('multer').MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('Ukuran file terlalu besar! Maksimal 2MB.');
        }
        return res.status(400).send('Error upload: ' + error.message);
    }
    if (error) {
        return res.status(400).send(error.message);
    }
    next();
});

module.exports = router;