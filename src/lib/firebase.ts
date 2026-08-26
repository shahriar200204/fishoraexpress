import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  writeBatch,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { Parcel, Merchant, Rider, SettlementRequest, SupportTicket, AuditLog } from '../types';

const env = (import.meta as any).env || {};

// Web App's Firebase configuration
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDjeC6kqNxliZGBMKwCIbziZyDnfFumJ9U",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "fishoraexpress.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "fishoraexpress",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "fishoraexpress.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "508930963593",
  appId: env.VITE_FIREBASE_APP_ID || "1:508930963593:web:f6e3b4b8b6132ba3c8ae58",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-P6QZ6G1M34"
};

// Initialize Firebase App safely (singleton)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics if supported in environment
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics ignored if blocked or unsupported
  });
}

// Enable offline cache if in browser
if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
      }
    });
  } catch {
    // ignore
  }
}

// ============================================================================
// FIRESTORE REALTIME DATA SYNC HELPERS
// ============================================================================

export const FirestoreSync = {
  // Check if Firestore is reachable and responsive
  isOnline: true,

  // --- PARCELS ---
  async saveParcel(parcel: Parcel): Promise<void> {
    try {
      const docRef = doc(db, 'parcels', parcel.id);
      await setDoc(docRef, { ...parcel, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveParcel sync error (saved locally):', err);
    }
  },

  async updateParcel(id: string, updates: Partial<Parcel>): Promise<void> {
    try {
      const docRef = doc(db, 'parcels', id);
      await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.warn('Firestore updateParcel sync error:', err);
    }
  },

  async batchSaveParcels(parcels: Parcel[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      parcels.forEach((p) => {
        const ref = doc(db, 'parcels', p.id);
        batch.set(ref, { ...p, updatedAt: new Date().toISOString() }, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore batchSaveParcels sync error:', err);
    }
  },

  async fetchAllParcels(): Promise<Parcel[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'parcels'));
      const list: Parcel[] = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data() as Parcel);
      });
      return list;
    } catch (err) {
      console.warn('Firestore fetchAllParcels error:', err);
      return [];
    }
  },

  subscribeToParcels(callback: (parcels: Parcel[]) => void): () => void {
    try {
      return onSnapshot(collection(db, 'parcels'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Parcel[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as Parcel);
          });
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore parcels live subscription notice:', err.message);
      });
    } catch {
      return () => {};
    }
  },

  // --- MERCHANTS ---
  async saveMerchant(merchant: Merchant): Promise<void> {
    try {
      const docRef = doc(db, 'merchants', merchant.id);
      await setDoc(docRef, merchant, { merge: true });
    } catch (err) {
      console.warn('Firestore saveMerchant sync error:', err);
    }
  },

  async fetchAllMerchants(): Promise<Merchant[]> {
    try {
      const snapshot = await getDocs(collection(db, 'merchants'));
      const list: Merchant[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Merchant);
      });
      return list;
    } catch (err) {
      return [];
    }
  },

  subscribeToMerchants(callback: (merchants: Merchant[]) => void): () => void {
    try {
      return onSnapshot(collection(db, 'merchants'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Merchant[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as Merchant);
          });
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore merchants subscription notice:', err.message);
      });
    } catch {
      return () => {};
    }
  },

  // --- RIDERS ---
  async saveRider(rider: Rider): Promise<void> {
    try {
      const docRef = doc(db, 'riders', rider.id);
      await setDoc(docRef, rider, { merge: true });
    } catch (err) {
      console.warn('Firestore saveRider error:', err);
    }
  },

  async fetchAllRiders(): Promise<Rider[]> {
    try {
      const snapshot = await getDocs(collection(db, 'riders'));
      const list: Rider[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Rider);
      });
      return list;
    } catch {
      return [];
    }
  },

  subscribeToRiders(callback: (riders: Rider[]) => void): () => void {
    try {
      return onSnapshot(collection(db, 'riders'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Rider[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as Rider);
          });
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore riders subscription notice:', err.message);
      });
    } catch {
      return () => {};
    }
  },

  // --- SETTLEMENTS & PAYOUTS ---
  async saveSettlement(settlement: SettlementRequest): Promise<void> {
    try {
      const docRef = doc(db, 'settlements', settlement.id);
      await setDoc(docRef, settlement, { merge: true });
    } catch (err) {
      console.warn('Firestore saveSettlement error:', err);
    }
  },

  // --- TICKETS ---
  async saveTicket(ticket: SupportTicket): Promise<void> {
    try {
      const docRef = doc(db, 'tickets', ticket.id);
      await setDoc(docRef, ticket, { merge: true });
    } catch (err) {
      console.warn('Firestore saveTicket error:', err);
    }
  },

  // --- AUDIT LOGS ---
  async saveAuditLog(log: AuditLog): Promise<void> {
    try {
      const docRef = doc(db, 'audit_logs', log.id);
      await setDoc(docRef, log, { merge: true });
    } catch (err) {
      console.warn('Firestore saveAuditLog error:', err);
    }
  }
};
