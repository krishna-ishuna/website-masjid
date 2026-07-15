const mongoose = require('mongoose');

const donasiSchema = new mongoose.Schema({
    namaDonatur: {
        type: String,
        required: [true, 'Nama donatur wajib diisi'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    telepon: {
        type: String,
        required: [true, 'Nomor telepon wajib diisi'],
        trim: true
    },
    nominal: {
        type: Number,
        required: [true, 'Nominal wajib diisi'],
        min: 1000
    },
    kategori: {
        type: String,
        enum: ['infaq', 'zakat', 'pembangunan', 'sosial', 'ramadhan', 'lainnya'],
        required: true
    },
    metode: {
        type: String,
        enum: ['transfer', 'tunai', 'qris'],
        default: 'transfer'
    },
    keterangan: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['menunggu', 'diverifikasi', 'ditolak'],
        default: 'menunggu'
    },
    catatanAdmin: {
        type: String,
        default: ''
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    tanggalVerifikasi: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Donasi', donasiSchema);