import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyB69Np-K-toJHI2hYJAHQFhEFFvICFiYLI",
    authDomain: "okhtoapp.firebaseapp.com",
    projectId: "okhtoapp",
    storageBucket: "okhtoapp.appspot.com",
    messagingSenderId: "317798037204",
    appId: "1:317798037204:web:cdccc81b36eb4bf40c6d41",
    measurementId: "G-MTHZRVBZHH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, database, firestore, storage };
