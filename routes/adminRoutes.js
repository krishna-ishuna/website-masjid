const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { protectAdmin } = require('../middleware/authMiddleware');

// 1. Tampilkan Halaman Login
router.get('/login', (req, res) => {
    res.render('admin/login', { error: null });
});

// 2. Proses Login (POST)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Cari admin berdasarkan username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.render('admin/login', { error: 'Username atau password salah!' });
        }

        // Cek kecocokan password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.render('admin/login', { error: 'Username atau password salah!' });
        }

        // Jika cocok, buat JWT Token
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token berlaku 1 hari
        );

        // Simpan token di Cookie browser (httpOnly agar aman dari XSS)
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 hari dalam milidetik
        });

        // Redirect ke dashboard
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Login Error:', error);
        res.render('admin/login', { error: 'Terjadi kesalahan pada server.' });
    }
});

// 3. Halaman Dashboard (Dilindungi Middleware)
router.get('/dashboard', protectAdmin, async (req, res) => {
    // Nanti di sini kita akan ambil data statistik dari database
    res.render('admin/dashboard', {
        user: req.user
    });
});

// 4. Proses Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token'); // Hapus token dari browser
    res.redirect('/admin/login');
});

module.exports = router;