import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssetModal } from './AssetModal';
import { Asset, RegulatoryTag } from '@/types';
import { Search, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MetadataCatalogProps {
  assets: Asset[];
  onCreateAsset: (asset: Omit<Asset, 'id'>) => void;
  onUpdateAsset: (id: string, asset: Partial<Asset>) => void;
  onDeleteAsset: (id: string) => void;
  userId: string;
  viewMode: boolean;
}

export const MetadataCatalog = ({
  assets,
  onCreateAsset,
  onUpdateAsset,
  onDeleteAsset,
  userId,
  viewMode
}: MetadataCatalogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegTag, setFilterRegTag] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegTag = filterRegTag === 'all' || asset.reg_tag === filterRegTag;
    const matchesType = filterType === 'all' || asset.asset_type === filterType;
    return matchesSearch && matchesRegTag && matchesType;
  });

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAsset(null);
    setModalOpen(true);
  };

  const handleSave = (asset: Omit<Asset, 'id'>) => {
    if (selectedAsset) {
      onUpdateAsset(selectedAsset.id, asset);
    } else {
      onCreateAsset(asset);
    }
  };

  const handleDeleteClick = (id: string) => {
    setAssetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (assetToDelete) {
      onDeleteAsset(assetToDelete);
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };

  const getRegTagColor = (tag?: RegulatoryTag) => {
    const colors = {
      GDPR: 'bg-primary/10 text-primary border-primary/20',
      HIPAA: 'bg-accent/10 text-accent border-accent/20',
      CCPA: 'bg-success/10 text-success border-success/20',
      None: 'bg-muted text-muted-foreground border-border'
    };
    return colors[tag || 'None'];
  };

  const getTypeColor = (type: string) => {
    const colors = {
      Policy: 'bg-primary text-primary-foreground',
      Claim: 'bg-accent text-accent-foreground',
      Model: 'bg-success text-success-foreground'
    };
    return colors[type as keyof typeof colors];
  };

  const policies = assets.filter(a => a.asset_type === 'Policy');
  const claims = assets.filter(a => a.asset_type === 'Claim');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Asset Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Policy">Policy</SelectItem>
              <SelectItem value="Claim">Claim</SelectItem>
              <SelectItem value="Model">Model</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRegTag} onValueChange={setFilterRegTag}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Reg Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="GDPR">GDPR</SelectItem>
              <SelectItem value="HIPAA">HIPAA</SelectItem>
              <SelectItem value="CCPA">CCPA</SelectItem>
            </SelectContent>
          </Select>

          {!viewMode && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Asset
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-lg font-semibold truncate">{asset.name}</h3>
                  <Badge className={getTypeColor(asset.asset_type)}>{asset.asset_type}</Badge>
                  <Badge variant="outline" className={getRegTagColor(asset.reg_tag)}>
                    {asset.reg_tag || 'None'}
                  </Badge>
                  {asset.pii_tag && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      PII
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{asset.description}</p>
                
                <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                  <span>ID: {asset.id.substring(0, 8)}...</span>
                  <span>Owner: {asset.owner_id.substring(0, 8)}...</span>
                  <span>Created: {new Date(asset.creation_date).toLocaleDateString()}</span>
                  {asset.claim_amount && <span>Amount: ${asset.claim_amount.toLocaleString()}</span>}
                  {asset.status && <span>Status: {asset.status}</span>}
                </div>
              </div>

              {!viewMode && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(asset)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(asset.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {filteredAssets.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No assets found matching your filters.</p>
          </Card>
        )}
      </div>

      <AssetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        asset={selectedAsset}
        policies={policies}
        claims={claims}
        userId={userId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
