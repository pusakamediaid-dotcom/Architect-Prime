/**
 * Firebase Cloud Functions
 * TypeScript entry point
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// HTTP Function - Hello World
export const helloWorld = functions.https.onRequest((req, res) => {
  res.json({
    message: 'Hello from Firebase!',
    timestamp: new Date().toISOString()
  });
});

// HTTP Function - Create User
export const createUser = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const userRef = db.collection('users').doc();
    await userRef.set({
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({
      message: 'User created',
      id: userRef.id
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Firestore Trigger - On user creation
export const onUserCreate = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const user = snap.data();
    console.log('New user created:', user.name);
    
    // Send welcome email via notification service
    // await sendWelcomeEmail(user.email);
    
    return null;
  });

// Scheduled Function - Daily cleanup
export const dailyCleanup = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    console.log('Running daily cleanup...');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    // Clean up old records
    // await cleanupOldRecords(cutoffDate);
    
    return null;
  });
