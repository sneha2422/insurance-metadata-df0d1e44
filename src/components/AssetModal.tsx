import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Asset, AssetType, RegTag, ClaimStatus } from '@/types';

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
    type: 'Policy',
    name: '',
    description: '',
    piiTag: false,
    regTag: 'None',
    dataType: 'Record',
    claimAmount: 0,
    status: 'New',
    policyId: '',
    sourceClaimId: []
  });

  useEffect(() => {
    if (asset) {
      setFormData(asset);
    } else {
      setFormData({
        type: 'Policy',
        name: '',
        description: '',
        piiTag: false,
        regTag: 'None',
        dataType: 'Record',
        claimAmount: 0,
        status: 'New',
        policyId: '',
        sourceClaimId: []
      });
    }
  }, [asset, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseData = {
      name: formData.name,
      description: formData.description,
      ownerId: userId,
      creationDate: asset?.creationDate || new Date().toISOString(),
      piiTag: formData.piiTag,
      regTag: formData.regTag as RegTag
    };

    let assetData: any = { ...baseData, type: formData.type };

    if (formData.type === 'Policy') {
      assetData.dataType = 'Record';
    } else if (formData.type === 'Claim') {
      assetData.claimAmount = Number(formData.claimAmount);
      assetData.status = formData.status;
      assetData.policyId = formData.policyId;
    } else if (formData.type === 'Model') {
      assetData.dataType = 'Result';
      assetData.sourceClaimId = formData.sourceClaimId;
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
            <Label htmlFor="type">Asset Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
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
              id="piiTag"
              checked={formData.piiTag}
              onCheckedChange={(checked) => setFormData({ ...formData, piiTag: checked })}
            />
            <Label htmlFor="piiTag" className="cursor-pointer">Contains PII</Label>
          </div>

          <div>
            <Label htmlFor="regTag">Regulatory Tag</Label>
            <Select
              value={formData.regTag}
              onValueChange={(value) => setFormData({ ...formData, regTag: value })}
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

          {formData.type === 'Claim' && (
            <>
              <div>
                <Label htmlFor="claimAmount">Claim Amount *</Label>
                <Input
                  id="claimAmount"
                  type="number"
                  value={formData.claimAmount}
                  onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
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
                <Label htmlFor="policyId">Policy *</Label>
                <Select
                  value={formData.policyId}
                  onValueChange={(value) => setFormData({ ...formData, policyId: value })}
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

          {formData.type === 'Model' && (
            <div>
              <Label>Source Claims *</Label>
              <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {claims.map((claim) => (
                  <div key={claim.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={claim.id}
                      checked={formData.sourceClaimId.includes(claim.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            sourceClaimId: [...formData.sourceClaimId, claim.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            sourceClaimId: formData.sourceClaimId.filter((id: string) => id !== claim.id)
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
