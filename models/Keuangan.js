const mongoose = require('mongoose');

const keuanganSchema = new mongoose.Schema({
    tanggal: {
        type: Date,
        default: Date.now
    },
    jenis: {
        type: String,
        enum: ['pemasukan', 'pengeluaran'],
        required: true
    },
    nominal: {
        type: Number,
        required: [true, 'Nominal wajib diisi'],
        min: 0
    },
    keterangan: {
        type: String,
        required: [true, 'Keterangan wajib diisi'],
        trim: true
    },
    kategori: {
        type: String,
        enum: ['infaq', 'zakat', 'donasi', 'listrik', 'honor', 'kebersihan', 'pembangunan', 'lainnya'],
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, { timestamps: true });

module.exports = mongoose.model('Keuangan', keuanganSchema);