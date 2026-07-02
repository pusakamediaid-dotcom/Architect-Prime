import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FirestoreService } from './services/firestore.service';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { EventService } from './services/event.service';

admin.initializeApp();
const db = admin.firestore();

const firestoreService = new FirestoreService(db);
const authService = new AuthService(admin.auth());
const notificationService = new NotificationService();
const eventService = new EventService();

export const createUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  try {
    const { name, email, phone } = data;

    const userRecord = await admin.auth().createUser({
      email: email,
      displayName: name,
      phoneNumber: phone
    });

    await firestoreService.createDocument('users', userRecord.uid, {
      name,
      email,
      phone,
      role: 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, uid: userRecord.uid };
  } catch (error) {
    console.error('Create User Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

export const onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    
    await eventService.publish('user.created', {
      userId: context.params.userId,
      email: userData.email,
      name: userData.name,
      timestamp: new Date().toISOString()
    });

    await notificationService.sendWelcomeEmail(userData.email, userData.name);
  });

export const updateUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { displayName, photoURL, phoneNumber } = data;
  const uid = context.auth.uid;

  try {
    await admin.auth().updateUser(uid, { displayName, photoURL, phoneNumber });
    await firestoreService.updateDocument('users', uid, {
      displayName,
      photoURL,
      phoneNumber,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

export const deleteUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const uid = context.auth.uid;
  const { targetUid, adminPassword } = data;

  const userDoc = await firestoreService.getDocument('users', context.auth.uid);
  if (userDoc?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  try {
    await admin.auth().deleteUser(targetUid);
    await firestoreService.deleteDocument('users', targetUid);
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

export const scheduledCleanup = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const oneWeekAgo = new Date(now.toDate());
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const inactiveUsers = await db.collection('users')
      .where('lastActive', '<', oneWeekAgo)
      .where('status', '==', 'inactive')
      .get();

    const batch = db.batch();
    inactiveUsers.forEach(doc => {
      batch.update(doc.ref, { markedForDeletion: true });
    });

    await batch.commit();
    console.log(`Marked ${inactiveUsers.size} inactive users for deletion`);
  });

export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderData = snap.data();
    
    await eventService.publish('order.created', {
      orderId: context.params.orderId,
      customerId: orderData.customerId,
      totalAmount: orderData.totalAmount,
      timestamp: new Date().toISOString()
    });

    const customerDoc = await firestoreService.getDocument('users', orderData.customerId);
    if (customerDoc?.email) {
      await notificationService.sendOrderConfirmation(
        customerDoc.email,
        customerDoc.name,
        context.params.orderId,
        orderData.totalAmount
      );
    }
  });

export const processPayment = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, paymentMethod, amount } = req.body;

  try {
    const orderDoc = await firestoreService.getDocument('orders', orderId);
    if (!orderDoc) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const paymentId = `pay_${Date.now()}`;
    
    await firestoreService.createDocument('payments', paymentId, {
      orderId,
      amount,
      paymentMethod,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await eventService.publish('payment.initiated', {
      paymentId,
      orderId,
      amount,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      paymentId,
      status: 'pending'
    });
  } catch (error) {
    console.error('Payment Error:', error);
    return res.status(500).json({ error: error.message });
  }
});