// Test Firebase connection
// Run: node testFirebase.js

require('dotenv').config();
const { admin, db } = require('./lib/firebase');

async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    
    // Test Firestore connection
    const testDoc = await db.collection('test').add({
      message: 'Firebase connection test',
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Firebase connected successfully!');
    console.log('Test document ID:', testDoc.id);
    
    // Clean up test document
    await db.collection('test').doc(testDoc.id).delete();
    console.log('✅ Test document cleaned up');
    
    // Test collections exist
    const collections = await db.listCollections();
    console.log('Available collections:', collections.map(col => col.id));
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
  }
}

testFirebaseConnection();
