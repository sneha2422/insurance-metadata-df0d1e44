import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Asset, AssetType, RegulatoryTag, ClaimStatus } from '@/types';

interface AssetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (asset: Omit<Asset, 'id'>) => void;
  asset?: Asset | null;
  policies: Asset[];
  claims: Asset[];
  userId: string;
}

export const AssetModal = ({ open, onClose, onSave, asset, policies, claims, userId }: AssetModalProps) => {
  const [formData, setFormData] = useState<any>({
    asset_type: 'Policy',
    name: '',
    description: '',
    pii_tag: false,
    reg_tag: 'None',
    data_type: 'Record',
    claim_amount: 0,
    status: 'New',
    policy_id: '',
    source_claim_ids: []
  });

  useEffect(() => {
    if (asset) {
      setFormData(asset);
    } else {
      setFormData({
        asset_type: 'Policy',
        name: '',
        description: '',
        pii_tag: false,
        reg_tag: 'None',
        data_type: 'Record',
        claim_amount: 0,
        status: 'New',
        policy_id: '',
        source_claim_ids: []
      });
    }
  }, [asset, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseData = {
      name: formData.name,
      description: formData.description,
      owner_id: userId,
      creation_date: asset?.creation_date || new Date().toISOString(),
      pii_tag: formData.pii_tag,
      reg_tag: formData.reg_tag as RegulatoryTag,
      asset_type: formData.asset_type
    };

    let assetData: any = { ...baseData };

    if (formData.asset_type === 'Policy') {
      assetData.data_type = 'Record';
    } else if (formData.asset_type === 'Claim') {
      assetData.claim_amount = Number(formData.claim_amount);
      assetData.status = formData.status;
      assetData.policy_id = formData.policy_id;
    } else if (formData.asset_type === 'Model') {
      assetData.data_type = 'Result';
      assetData.source_claim_ids = formData.source_claim_ids;
    }

    onSave(assetData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? 'Edit Asset' : 'Create New Asset'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="asset_type">Asset Type</Label>
            <Select
              value={formData.asset_type}
              onValueChange={(value) => setFormData({ ...formData, asset_type: value })}
              disabled={!!asset}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Policy">Policy</SelectItem>
                <SelectItem value="Claim">Claim</SelectItem>
                <SelectItem value="Model">Model</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pii_tag"
              checked={formData.pii_tag}
              onCheckedChange={(checked) => setFormData({ ...formData, pii_tag: checked })}
            />
            <Label htmlFor="pii_tag" className="cursor-pointer">Contains PII</Label>
          </div>

          <div>
            <Label htmlFor="reg_tag">Regulatory Tag</Label>
            <Select
              value={formData.reg_tag}
              onValueChange={(value) => setFormData({ ...formData, reg_tag: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="GDPR">GDPR</SelectItem>
                <SelectItem value="HIPAA">HIPAA</SelectItem>
                <SelectItem value="CCPA">CCPA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.asset_type === 'Claim' && (
            <>
              <div>
                <Label htmlFor="claim_amount">Claim Amount *</Label>
                <Input
                  id="claim_amount"
                  type="number"
                  value={formData.claim_amount}
                  onChange={(e) => setFormData({ ...formData, claim_amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="policy_id">Policy *</Label>
                <Select
                  value={formData.policy_id}
                  onValueChange={(value) => setFormData({ ...formData, policy_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.map((policy) => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {policy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {formData.asset_type === 'Model' && (
            <div>
              <Label>Source Claims *</Label>
              <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {claims.map((claim) => (
                  <div key={claim.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={claim.id}
                      checked={formData.source_claim_ids.includes(claim.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            source_claim_ids: [...formData.source_claim_ids, claim.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            source_claim_ids: formData.source_claim_ids.filter((id: string) => id !== claim.id)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={claim.id} className="cursor-pointer">
                      {claim.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {asset ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
