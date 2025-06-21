import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  DocumentData,
  CollectionReference,
  WithFieldValue,
  QueryConstraint,
  setDoc
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from './use-auth';

export function useFirestore<T extends DocumentData>() {
  const [documents, setDocuments] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Get a document by ID
  const getDocument = async (collectionName: string, id: string) => {
    setLoading(true);
    try {
      setError('');
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
      } else {
        return null;
      }
    } catch (err: any) {
      console.error(`Error getting document from ${collectionName}:`, err);
      setError(err.message || `Failed to get document from ${collectionName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a document by user ID (useful for user profiles)
  const getDocumentByUserId = async (collectionName: string, userId: string) => {
    setLoading(true);
    try {
      setError('');
      const q = query(
        collection(db, collectionName),
        where("uid", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      let result = null;
      
      querySnapshot.forEach((doc) => {
        result = { id: doc.id, ...doc.data() } as T & { id: string };
      });
      
      return result;
    } catch (err: any) {
      console.error(`Error getting document by user ID from ${collectionName}:`, err);
      setError(err.message || `Failed to get document by user ID from ${collectionName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get all documents from a collection
  const getDocuments = async (collectionName: string, ...queryConstraints: QueryConstraint[]) => {
    setLoading(true);
    try {
      setError('');
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      const results: (T & { id: string })[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as T & { id: string });
      });
      
      setDocuments(results);
      return results;
    } catch (err: any) {
      console.error(`Error getting documents from ${collectionName}:`, err);
      setError(err.message || `Failed to get documents from ${collectionName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to a collection with real-time updates
  const subscribeToCollection = (
    collectionName: string,
    callback: (docs: (T & { id: string })[]) => void,
    ...queryConstraints: QueryConstraint[]
  ) => {
    setLoading(true);
    try {
      setError('');
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...queryConstraints);
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const results: (T & { id: string })[] = [];
        snapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() } as T & { id: string });
        });
        
        setDocuments(results);
        callback(results);
        setLoading(false);
      }, (err) => {
        console.error(`Error subscribing to ${collectionName}:`, err);
        setError(err.message || `Failed to subscribe to ${collectionName}`);
        setLoading(false);
      });
      
      // Return the unsubscribe function
      return unsubscribe;
    } catch (err: any) {
      console.error(`Error setting up subscription to ${collectionName}:`, err);
      setError(err.message || `Failed to set up subscription to ${collectionName}`);
      setLoading(false);
      return () => {}; // Return a no-op function
    }
  };

  // Add a document to a collection
  const addDocument = async (collectionName: string, data: WithFieldValue<T>) => {
    setLoading(true);
    try {
      setError('');
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?.uid
      });
      
      return { id: docRef.id } as { id: string };
    } catch (err: any) {
      console.error(`Error adding document to ${collectionName}:`, err);
      setError(err.message || `Failed to add document to ${collectionName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set a document with a specific ID
  const setDocument = async (collectionName: string, id: string, data: WithFieldValue<T>) => {
    setLoading(true);
    try {
      setError('');
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date()
      }, { merge: true });
      
      return { id };
    } catch (err: any) {
      console.error(`Error setting document in ${collectionName}:`, err);
      setError(err.message || `Failed to set document in ${collectionName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a document
  const updateDocument = async (collectionName: string, id: string, data: Partial<T>) => {
    setLoading(true);
    try {
      setError('');
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      
      return { id };
    } catch (err: any) {
      console.error(`Error updating document in ${collectionName}:`, err);
      setError(err.message || `Failed to update document in ${collectionName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a document
  const deleteDocument = async (collectionName: string, id: string) => {
    setLoading(true);
    try {
      setError('');
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      
      return { id };
    } catch (err: any) {
      console.error(`Error deleting document from ${collectionName}:`, err);
      setError(err.message || `Failed to delete document from ${collectionName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    documents,
    loading,
    error,
    getDocument,
    getDocumentByUserId,
    getDocuments,
    subscribeToCollection,
    addDocument,
    setDocument,
    updateDocument,
    deleteDocument
  };
}