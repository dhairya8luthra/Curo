import admin from "firebase-admin";
import { readFile } from 'fs/promises';

async function initializeFirebaseAdmin() {
    try {
        const data = await readFile('./serviceaccountKey.json', { encoding: 'utf8' });
        const serviceAccount = JSON.parse(data);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        console.log("Firebase Admin initialized successfully.");
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
    }
}

initializeFirebaseAdmin();

export default admin;
