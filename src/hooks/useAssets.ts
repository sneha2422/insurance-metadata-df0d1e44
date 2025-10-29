import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Asset } from '@/types';
import { toast } from '@/hooks/use-toast';

const COLLECTION_PATH = 'metadata_catalog';

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, COLLECTION_PATH));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Asset[];
        setAssets(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching assets:', error);
        toast({
          title: 'Error',
          description: 'Failed to load assets',
          variant: 'destructive'
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createAsset = async (asset: Omit<Asset, 'id'>) => {
    try {
      await addDoc(collection(db, COLLECTION_PATH), asset);
      toast({
        title: 'Success',
        description: 'Asset created successfully'
      });
    } catch (error) {
      console.error('Error creating asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to create asset',
        variant: 'destructive'
      });
    }
  };

  const updateAsset = async (id: string, asset: Partial<Asset>) => {
    try {
      await updateDoc(doc(db, COLLECTION_PATH, id), asset);
      toast({
        title: 'Success',
        description: 'Asset updated successfully'
      });
    } catch (error) {
      console.error('Error updating asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to update asset',
        variant: 'destructive'
      });
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_PATH, id));
      toast({
        title: 'Success',
        description: 'Asset deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete asset',
        variant: 'destructive'
      });
    }
  };

  return { assets, loading, createAsset, updateAsset, deleteAsset };
};
