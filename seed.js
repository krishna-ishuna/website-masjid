require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Terhubung ke MongoDB');

        // Cek apakah sudah ada admin
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  Admin sudah ada, hapus dulu jika ingin reset.');
            process.exit(0);
        }

        // Buat admin baru
        const adminBaru = await Admin.create({
            username: 'admin',
            namaLengkap: 'Ketua DKM Masjid',
            password: 'admin123', // Nanti bisa diganti dari panel admin
            role: 'superadmin'
        });

        console.log('✅ Admin berhasil dibuat!');
        console.log('📧 Username: admin');
        console.log('🔑 Password: admin123');
        console.log('⚠️  Segera ganti password setelah login pertama!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedAdmin();