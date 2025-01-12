// server/server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();

// Middleware
app.use(express.json());

// CORS Configuration
const corsOptions = {
  origin: [
    'https://qonnectr.vercel.app',    // Production frontend
    'http://localhost:3001',          // Local development
    'http://localhost:3000'           // Alternative local port
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    let serviceAccount;
    
    if (process.env.NODE_ENV === 'production') {
      // For production (Render) - using the mounted secret file
      serviceAccount = require('/etc/secrets/firebase-service-account.json');
      console.log('Using production Firebase credentials');
    } else {
      // For local development
      serviceAccount = require('./secrets/firebase-service-account.json');
      console.log('Using local Firebase credentials');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://connectq-e3fb5-default-rtdb.firebaseio.com/',
    });

    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

// Initialize Firebase
initializeFirebase();

const db = admin.firestore();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint for CORS
app.get('/test', (req, res) => {
  res.json({ 
    message: 'CORS is working',
    origin: req.headers.origin,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { fullName, displayName, email, password } = req.body;

  // Input validation
  if (!fullName || !displayName || !email || !password) {
    return res.status(400).json({ 
      message: 'Missing required fields.',
      details: {
        fullName: !fullName ? 'Full name is required' : null,
        displayName: !displayName ? 'Display name is required' : null,
        email: !email ? 'Email is required' : null,
        password: !password ? 'Password is required' : null
      }
    });
  }

  try {
    // Check if username already exists
    const usernameDoc = await db.collection('usernames')
      .doc(displayName.toLowerCase().replace(/\s+/g, ''))
      .get();

    if (usernameDoc.exists) {
      return res.status(400).json({
        message: 'Username already exists',
        error: 'duplicate_username'
      });
    }

    // Obtain access token for Auth0 Management API
    const tokenResponse = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        grant_type: 'client_credentials',
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Create the user in Auth0
    const createUserResponse = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
      {
        email: email,
        password: password,
        connection: 'Username-Password-Authentication',
        user_metadata: {
          full_name: fullName,
          display_name: displayName,
        },
        email_verified: false,
        verify_email: true,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    const userId = createUserResponse.data.user_id;

    // Store user data in Firestore
    await db.collection('users').doc(userId).set({
      uid: userId,
      fullName: fullName,
      displayName: displayName,
      email: email,
      profilePicture: null,
      username: displayName.toLowerCase().replace(/\s+/g, ''),
      contributions: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Store username mapping
    await db.collection('usernames').doc(displayName.toLowerCase().replace(/\s+/g, '')).set({
      username: displayName.toLowerCase().replace(/\s+/g, ''),
      userId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ 
      message: 'User created successfully',
      success: true
    });

  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.data?.message?.includes('email')) {
      return res.status(400).json({
        message: 'Email already exists',
        error: 'duplicate_email'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        message: 'Too many requests. Please try again later.',
        error: 'rate_limit'
      });
    }

    res.status(500).json({
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' 
        ? error.response?.data || error.message 
        : 'An unexpected error occurred'
    });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`CORS enabled for origins:`, corsOptions.origin);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // In production, you might want to exit the process and let your process manager restart it
  // process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // In production, you might want to exit the process and let your process manager restart it
  // process.exit(1);
});