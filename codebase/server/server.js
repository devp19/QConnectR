// server/server.js

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();

app.use(express.json());

// Configure CORS options
const corsOptions = {
  origin: 'http://localhost:3001', // Allow requests from this origin
  methods: ['GET', 'POST', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200, // For legacy browser support
};

// Use CORS middleware with options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Initialize Firebase Admin SDK
const serviceAccount = require('./secrets/connectq-e3fb5-firebase-adminsdk-czm27-593590f7d1.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://connectq-e3fb5-default-rtdb.firebaseio.com/',
});

const db = admin.firestore();

app.post('/api/signup', async (req, res) => {
  const { fullName, displayName, email, password } = req.body;

  // Input validation
  if (!fullName || !displayName || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
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
    });

    // Store username mapping
    await db.collection('usernames').doc(displayName.toLowerCase().replace(/\s+/g, '')).set({
      username: displayName.toLowerCase().replace(/\s+/g, ''),
      userId: userId,
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(
      'Error creating user:',
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      message: 'Error creating user',
      error: error.response ? error.response.data : error.message,
    });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});