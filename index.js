
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const routes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Student Internship Portal API is running',
  });
});

// Handle unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    message: 'API endpoint not found',
  });
});

// Serve the built React application when deployed together
app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'client', 'dist', 'index.html'),
    (error) => {
      if (error && !res.headersSent) {
        res.status(404).send('Frontend build not found.');
      }
    }
  );
});

// Connect to MongoDB before accepting requests
async function startServer() {
  try {
    if (!process.env.MONGO_DB_URI) {
      throw new Error('MONGO_DB_URI is missing from the environment');
    }

    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log('MongoDB connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
