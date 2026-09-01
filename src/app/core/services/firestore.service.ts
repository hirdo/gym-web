import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  DocumentData,
  QueryConstraint,
  Unsubscribe
} from 'firebase/firestore';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private app: FirebaseApp;
  private db: Firestore;
  private initialized = false;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.db = getFirestore(this.app);
    this.initialized = !!environment.firebase.projectId && !environment.firebase.projectId.startsWith('YOUR_');
  }

  isConfigured(): boolean {
    return this.initialized;
  }

  async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    if (!this.initialized) return null;
    const snap = await getDoc(doc(this.db, collectionName, docId));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
  }

  async setDocument(collectionName: string, docId: string, data: DocumentData, merge = true): Promise<void> {
    if (!this.initialized) return;
    await setDoc(doc(this.db, collectionName, docId), this.stripUndefined(data), { merge });
  }

  async updateDocument(collectionName: string, docId: string, data: DocumentData): Promise<void> {
    if (!this.initialized) return;
    await updateDoc(doc(this.db, collectionName, docId), this.stripUndefined(data));
  }

  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    if (!this.initialized) return;
    await deleteDoc(doc(this.db, collectionName, docId));
  }

  async addDocument(collectionName: string, data: DocumentData): Promise<string> {
    if (!this.initialized) return '';
    const ref = await addDoc(collection(this.db, collectionName), this.stripUndefined(data));
    return ref.id;
  }

  async queryDocuments<T>(collectionName: string, ...constraints: QueryConstraint[]): Promise<T[]> {
    if (!this.initialized) return [];
    const q = query(collection(this.db, collectionName), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
  }

  subscribe<T>(
    collectionName: string,
    callback: (docs: T[]) => void,
    ...constraints: QueryConstraint[]
  ): Unsubscribe {
    if (!this.initialized) return () => {};
    const q = query(collection(this.db, collectionName), ...constraints);
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as T)));
    });
  }

  private stripUndefined(data: DocumentData): DocumentData {
    const clean: DocumentData = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        clean[key] = value.map(item =>
          item && typeof item === 'object' && !Array.isArray(item)
            ? this.stripUndefined(item)
            : item
        );
      } else if (value && typeof value === 'object') {
        clean[key] = this.stripUndefined(value);
      } else {
        clean[key] = value;
      }
    }
    return clean;
  }

  where = where;
  orderBy = orderBy;
}
