require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Program = require('../src/models/Program');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-enrollment';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin@brdinstitute.com' });
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seed.');
      process.exit(0);
      return;
    }

    const passwordHash = await bcrypt.hash('Admin@123', 12);
    await User.create({
      name: 'System Admin',
      email: 'admin@brdinstitute.com',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE'
    });
    console.log('Admin user created: admin@brdinstitute.com / Admin@123');

    const programCount = await Program.countDocuments();
    if (programCount === 0) {
      await Program.insertMany([
        { name: 'Full Stack Development', description: 'MERN stack and modern web development', duration: '6 months', fee: 25000 },
        { name: 'Data Science', description: 'Python, ML, and data analytics', duration: '6 months', fee: 30000 },
        { name: 'Digital Marketing', description: 'SEO, SEM, and content marketing', duration: '4 months', fee: 18000 }
      ]);
      console.log('Sample programs created.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
