const jwt = require('jsonwebtoken');

// Middleware untuk melindungi route admin
const protectAdmin = (req, res, next) => {
    // Ambil token dari cookie
    const token = req.cookies.token;

    // Jika tidak ada token, tendang ke halaman login
    if (!token) {
        return res.redirect('/admin/login');
    }

    try {
        // Verifikasi token apakah asli (ditandatangani dengan JWT_SECRET kita)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Simpan data user ke dalam request agar bisa dipakai di route selanjutnya
        req.user = decoded;
        next(); // Lanjut ke route berikutnya
    } catch (error) {
        // Jika token rusak atau kadaluarsa, hapus cookie dan tendang ke login
        res.clearCookie('token');
        return res.redirect('/admin/login');
    }
};

module.exports = { protectAdmin };