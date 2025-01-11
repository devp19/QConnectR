// server/server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();

app.use(express.json());

// Configure CORS options based on environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://qonnectr.vercel.app/'] // Replace with your Vercel domain
    : ['http://localhost:3001'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Initialize Firebase Admin SDK
// For production, we'll use environment variables instead of a local file
let serviceAccount;
if (process.env.NODE_ENV === 'production') {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require('./secrets/connectq-e3fb5-firebase-adminsdk-czm27-593590f7d1.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://connectq-e3fb5-default-rtdb.firebaseio.com/',
});

const db = admin.firestore();

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.post('/api/signup', async (req, res) => {
  const { fullName, displayName, email, password } = req.body;

  if (!fullName || !displayName || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
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

    await db.collection('users').doc(userId).set({
      uid: userId,
      fullName: fullName,
      displayName: displayName,
      email: email,
      profilePicture: null,
      username: displayName.toLowerCase().replace(/\s+/g, ''),
      contributions: 0,
    });

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

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});