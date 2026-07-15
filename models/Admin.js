const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username wajib diisi'],
        unique: true,
        trim: true,
        lowercase: true
    },
    namaLengkap: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: [true, 'Password wajib diisi'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin'],
        default: 'admin'
    }
}, { timestamps: true });

// Hash password sebelum disimpan (Versi Async yang benar untuk Mongoose modern)
adminSchema.pre('save', async function () {
    // Jika password tidak diubah, langsung stop proses ini
    if (!this.isModified('password')) return;

    // Buat salt dan hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method untuk cek password saat login
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Sembunyikan password saat data dikirim ke JSON (agar tidak bocor ke frontend)
adminSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('Admin', adminSchema);