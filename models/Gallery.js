const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    judul: {
        type: String,
        required: [true, 'Judul foto wajib diisi'],
        trim: true
    },
    deskripsi: {
        type: String,
        default: '',
        trim: true
    },
    kategori: {
        type: String,
        enum: ['kajian', 'kegiatan', 'pembangunan', 'sosial', 'ramadhan', 'lainnya'],
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    tanggal: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);