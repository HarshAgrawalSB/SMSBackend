const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');
const Program = require('./models/Program');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const leadRoutes = require('./routes/leadRoutes');
const studentRoutes = require('./routes/studentRoutes');
const programRoutes = require('./routes/programRoutes');

const app = express();

connectDB();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/students', studentRoutes);

// Must be before /api/programs mount so /public is not treated as :id
app.get('/api/programs/public', async (req, res) => {
  try {
    const programs = await Program.find().select('name _id').sort({ name: 1 }).lean();
    res.json({ success: true, data: programs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.use('/api/programs', programRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route for Vercel
app.get('/', (req, res) => {
  res.json({ 
    message: 'Student Enrollment API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      leads: '/api/leads',
      students: '/api/students',
      programs: '/api/programs'
    }
  });
});

app.use(errorMiddleware);

module.exports = app;
