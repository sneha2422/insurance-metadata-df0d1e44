import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    const fetchAssets = async () => {
      const { data, error } = await supabase
        .from('metadata_catalog')
        .select('*')
        .order('creation_date', { ascending: false });

      if (error) {
        console.error('Error fetching assets:', error);
        toast({
          title: 'Error',
          description: 'Failed to load assets',
          variant: 'destructive'
        });
      } else {
        setAssets(data || []);
      }
      setLoading(false);
    };

    fetchAssets();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('metadata_catalog_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'metadata_catalog'
        },
        () => {
          // Refetch when any change occurs
          fetchAssets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createAsset = async (asset: Omit<Asset, 'id'>) => {
    try {
      const { error } = await supabase
        .from('metadata_catalog')
        .insert([asset]);

      if (error) throw error;

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
      const { error } = await supabase
        .from('metadata_catalog')
        .update(asset)
        .eq('id', id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('metadata_catalog')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
