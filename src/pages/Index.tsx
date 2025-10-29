import { useState, useEffect } from 'react';
import { auth, initializeAuth } from '@/lib/firebase';
import { useAssets } from '@/hooks/useAssets';
import { MetadataCatalog } from '@/components/MetadataCatalog';
import { DataLineageVisualizer } from '@/components/DataLineageVisualizer';
import { FraudDashboard } from '@/components/FraudDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Network, AlertTriangle, Eye, EyeOff, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [userId, setUserId] = useState<string>('');
  const [viewMode, setViewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const { assets, loading: assetsLoading, createAsset, updateAsset, deleteAsset } = useAssets();

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await initializeAuth();
        setUserId(user?.uid || 'anonymous');
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        toast({
          title: 'Authentication Error',
          description: 'Failed to authenticate. Please refresh the page.',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    initialize();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Insurance Metadata Catalog</h1>
                <p className="text-xs text-muted-foreground">Data Lineage & Fraud Detection</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-mono text-xs">{userId.substring(0, 8)}...</span>
              </div>
              <Button
                variant={viewMode ? "outline" : "default"}
                size="sm"
                onClick={() => setViewMode(!viewMode)}
                className="gap-2"
              >
                {viewMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {viewMode ? 'View Only' : 'Edit Mode'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="catalog" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="catalog" className="gap-2">
              <Shield className="h-4 w-4" />
              Catalog
            </TabsTrigger>
            <TabsTrigger value="lineage" className="gap-2">
              <Network className="h-4 w-4" />
              Lineage
            </TabsTrigger>
            <TabsTrigger value="fraud" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Fraud
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
            <Card className="p-6">
              <MetadataCatalog
                assets={assets}
                onCreateAsset={createAsset}
                onUpdateAsset={updateAsset}
                onDeleteAsset={deleteAsset}
                userId={userId}
                viewMode={viewMode}
              />
            </Card>
          </TabsContent>

          <TabsContent value="lineage">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Data Lineage Flow</h2>
              <p className="text-muted-foreground mb-6">
                Visualize the flow of data from Policies through Claims to Reserve Models.
              </p>
              <DataLineageVisualizer assets={assets} />
            </Card>
          </TabsContent>

          <TabsContent value="fraud">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Fraud Detection Dashboard</h2>
                <p className="text-muted-foreground">
                  Real-time fraud analysis using rule-based detection algorithms.
                </p>
              </div>
              <FraudDashboard assets={assets} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
