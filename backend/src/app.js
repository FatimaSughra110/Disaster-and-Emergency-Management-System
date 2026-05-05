const express = require('express');
const cors = require('cors');
require('./db'); // Initialize Oracle pool

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default
  credentials
