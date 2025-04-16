'use client';

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface Props {
  params: {
    id: string;
  };
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function PWAPage({ params }: Props) {
  const { id } = params;

  // Fetch the PWA configuration from Firebase Firestore.
  const docRef = doc(db, "pwaConfigs", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const pwaConfig = docSnap.data();
    // TODO: Implement your PWA logic here using the pwaConfig.
    return (
      <div>
        <h1>PWA Configuration</h1>
        <p>Unique ID: {id}</p>
        <p>Original URL: {pwaConfig.originalUrl}</p>
        {/* Display any other PWA configurations here. */}
      </div>
    );
  } else {
    return <div>PWA configuration not found.</div>;
  }
}
