const mongoose = require('mongoose');

const pengumumanSchema = new mongoose.Schema({
    judul: {
        type: String,
        required: [true, 'Judul pengumuman wajib diisi'],
        trim: true
    },
    isi: {
        type: String,
        required: [true, 'Isi pengumuman wajib diisi']
    },
    kategori: {
        type: String,
        enum: ['kajian', 'kegiatan', 'pengumuman', 'donasi'],
        default: 'pengumuman'
    },
    gambar: {
        type: String,
        default: ''
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

module.exports = mongoose.model('Pengumuman', pengumumanSchema);