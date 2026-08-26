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
  isOnline: true,

  // --- PARCELS ---
  async saveParcel(parcel: Parcel): Promise<boolean> {
    try {
      const docRef = doc(db, 'parcels', parcel.id);
      await setDoc(docRef, { ...parcel, updatedAt: new Date().toISOString() }, { merge: true });
      console.log('✅ Firestore: Saved parcel', parcel.id);
      return true;
    } catch (err: any) {
      console.error('❌ Firestore saveParcel error:', err?.message || err);
      return false;
    }
  },

  async updateParcel(id: string, updates: Partial<Parcel>): Promise<boolean> {
    try {
      const docRef = doc(db, 'parcels', id);
      await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
      console.log('✅ Firestore: Updated parcel', id);
      return true;
    } catch (err: any) {
      console.error('❌ Firestore updateParcel error:', err?.message || err);
      return false;
    }
  },

  async deleteParcel(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'parcels', id);
      await deleteDoc(docRef);
      console.log('✅ Firestore: Deleted parcel', id);
      return true;
    } catch (err: any) {
      console.error('❌ Firestore deleteParcel error:', err);
      return false;
    }
  },

  async batchSaveParcels(parcels: Parcel[]): Promise<boolean> {
    try {
      const batch = writeBatch(db);
      parcels.forEach((p) => {
        const ref = doc(db, 'parcels', p.id);
        batch.set(ref, { ...p, updatedAt: new Date().toISOString() }, { merge: true });
      });
      await batch.commit();
      console.log(`✅ Firestore: Batch saved ${parcels.length} parcels`);
      return true;
    } catch (err: any) {
      console.error('❌ Firestore batchSaveParcels error:', err);
      return false;
    }
  },

  async fetchAllParcels(): Promise<Parcel[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'parcels'));
      const list: Parcel[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Parcel);
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
        const list: Parcel[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Parcel);
        });
        callback(list);
      }, (err) => {
        console.warn('Firestore parcels live subscription notice:', err.message);
      });
    } catch {
      return () => {};
    }
  },

  // --- MERCHANTS ---
  async saveMerchant(merchant: Merchant): Promise<boolean> {
    try {
      const docRef = doc(db, 'merchants', merchant.id);
      await setDoc(docRef, merchant, { merge: true });
      console.log('✅ Firestore: Saved merchant', merchant.id);
      return true;
    } catch (err: any) {
      console.error('❌ Firestore saveMerchant error:', err?.message || err);
      return false;
    }
  },

  async fetchAllMerchants(): Promise<Merchant[]> {
    try {
      const snapshot = await getDocs(collection(db, 'merchants'));
      const list: Merchant[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Merchant);
      });
      return list;
    } catch (err) {
      return [];
    }
  },

  subscribeToMerchants(callback: (merchants: Merchant[]) => void): () => void {
    try {
      return onSnapshot(collection(db, 'merchants'), (snapshot) => {
        const list: Merchant[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Merchant);
        });
        callback(list);
      }, (err) => {
        console.warn('Firestore merchants subscription notice:', err.message);
      });
    } catch {
      return () => {};
    }
  },

  // --- RIDERS ---
  async saveRider(rider: Rider): Promise<boolean> {
    try {
      const docRef = doc(db, 'riders', rider.id);
      await setDoc(docRef, rider, { merge: true });
      console.log('✅ Firestore: Saved rider', rider.id, rider.name);
      return true;
    } catch (err: any) {
      console.error('❌ Firestore saveRider error:', err?.message || err);
      return false;
    }
  },

  async deleteRider(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'riders', id);
      await deleteDoc(docRef);
      console.log('✅ Firestore: Deleted rider', id);
      return true;
    } catch (err: any) {
      console.error('❌ Firestore deleteRider error:', err);
      return false;
    }
  },

  async fetchAllRiders(): Promise<Rider[]> {
    try {
      const snapshot = await getDocs(collection(db, 'riders'));
      const list: Rider[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Rider);
      });
      return list;
    } catch {
      return [];
    }
  },

  subscribeToRiders(callback: (riders: Rider[]) => void): () => void {
    try {
      return onSnapshot(collection(db, 'riders'), (snapshot) => {
        const list: Rider[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Rider);
        });
        callback(list);
      }, (err) => {
        console.warn('Firestore riders subscription notice:', err.message);
      });
    } catch {
      return () => {};
    }
  },

  // --- SETTLEMENTS & PAYOUTS ---
  async saveSettlement(settlement: SettlementRequest): Promise<boolean> {
    try {
      const docRef = doc(db, 'settlements', settlement.id);
      await setDoc(docRef, settlement, { merge: true });
      console.log('✅ Firestore: Saved settlement', settlement.id);
      return true;
    } catch (err: any) {
      console.error('❌ Firestore saveSettlement error:', err);
      return false;
    }
  },

  // --- TICKETS ---
  async saveTicket(ticket: SupportTicket): Promise<boolean> {
    try {
      const docRef = doc(db, 'tickets', ticket.id);
      await setDoc(docRef, ticket, { merge: true });
      console.log('✅ Firestore: Saved ticket', ticket.id);
      return true;
    } catch (err: any) {
      console.error('❌ Firestore saveTicket error:', err);
      return false;
    }
  },

  // --- AUDIT LOGS ---
  async saveAuditLog(log: AuditLog): Promise<boolean> {
    try {
      const docRef = doc(db, 'audit_logs', log.id);
      await setDoc(docRef, log, { merge: true });
      return true;
    } catch (err: any) {
      return false;
    }
  },

  // --- ADMIN CREDENTIALS & SECURITY ---
  async saveAdminCredentials(creds: any): Promise<boolean> {
    try {
      const docRef = doc(db, 'system_config', 'admin_credentials');
      await setDoc(docRef, { ...creds, updatedAt: new Date().toISOString() }, { merge: true });
      console.log('✅ Firestore: Saved admin credentials');
      return true;
    } catch (err: any) {
      console.warn('Firestore saveAdminCredentials warning:', err?.message);
      return false;
    }
  },

  // --- FULL CLOUD PUSH / SYNC ---
  async pushAllLocalToFirestore(data: {
    parcels: Parcel[];
    merchants: Merchant[];
    riders: Rider[];
    settlements?: SettlementRequest[];
  }): Promise<{ success: boolean; message: string }> {
    try {
      const batch = writeBatch(db);

      data.parcels.forEach((p) => {
        batch.set(doc(db, 'parcels', p.id), { ...p, updatedAt: new Date().toISOString() }, { merge: true });
      });

      data.merchants.forEach((m) => {
        batch.set(doc(db, 'merchants', m.id), m, { merge: true });
      });

      data.riders.forEach((r) => {
        batch.set(doc(db, 'riders', r.id), r, { merge: true });
      });

      if (data.settlements) {
        data.settlements.forEach((s) => {
          batch.set(doc(db, 'settlements', s.id), s, { merge: true });
        });
      }

      await batch.commit();
      return {
        success: true,
        message: `Successfully synchronized ${data.parcels.length} parcels, ${data.merchants.length} merchants, and ${data.riders.length} riders to Firebase Firestore!`
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to sync to Firestore'
      };
    }
  }
};
