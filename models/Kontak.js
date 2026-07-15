const mongoose = require('mongoose');

const kontakSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: [true, 'Nama wajib diisi'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    telepon: {
        type: String,
        trim: true
    },
    subjek: {
        type: String,
        required: [true, 'Subjek wajib diisi'],
        trim: true
    },
    pesan: {
        type: String,
        required: [true, 'Pesan wajib diisi']
    },
    status: {
        type: String,
        enum: ['baru', 'dibaca', 'dibalas', 'diarsipkan'],
        default: 'baru'
    }
}, { timestamps: true });

module.exports = mongoose.model('Kontak', kontakSchema);