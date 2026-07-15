const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads ada
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate nama file unik: timestamp + random + ekstensi asli
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'pengumuman-' + uniqueSuffix + ext);
    }
});

// Filter: hanya terima file gambar
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (JPG, PNG, WEBP, GIF) yang diperbolehkan!'));
    }
};

// Buat instance multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // Maksimal 2MB
    }
});

// Fungsi helper untuk hapus file gambar lama
const hapusFileLama = (filename) => {
    if (!filename) return;

    const filePath = path.join(uploadDir, filename);
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Gagal hapus file lama:', err.message);
        } else {
            console.log('File lama berhasil dihapus:', filename);
        }
    });
};

// Konfigurasi khusus untuk upload multiple (Galeri)
const storageGaleri = multer.diskStorage({
    destination: function (req, file, cb) {
        const galeriDir = path.join(__dirname, '../public/uploads/galeri');
        if (!fs.existsSync(galeriDir)) {
            fs.mkdirSync(galeriDir, { recursive: true });
        }
        cb(null, galeriDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'galeri-' + uniqueSuffix + ext);
    }
});

const uploadGaleri = multer({
    storage: storageGaleri,
    fileFilter: fileFilter,
    limits: {
        fileSize: 3 * 1024 * 1024,
        files: 20  // <-- TAMBAHKAN INI: Batasi jumlah file
    }
});

// Fungsi helper untuk hapus file galeri
const hapusFileGaleri = (filename) => {
    if (!filename) return;
    const filePath = path.join(__dirname, '../public/uploads/galeri', filename);
    fs.unlink(filePath, (err) => {
        if (err) console.error('Gagal hapus file galeri:', err.message);
    });
};

module.exports = { upload, uploadGaleri, hapusFileLama, hapusFileGaleri };