import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import 'dotenv/config';
import mongoose from 'mongoose';
import User, { ROLES } from '../models/User.js';

const run = async () => {
  const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ Thiếu MONGODB_URI / ADMIN_EMAIL / ADMIN_PASSWORD trong .env');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  const existed = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existed) {
    console.log(`ℹ️ Admin ${ADMIN_EMAIL} đã tồn tại, bỏ qua.`);
  } else {
    await User.create({
      name: ADMIN_NAME || 'Quản trị viên',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: ROLES.ADMIN
    });
    console.log(`✅ Đã tạo admin: ${ADMIN_EMAIL}`);
  }
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
