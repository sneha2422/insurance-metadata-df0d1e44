export type RegTag = 'GDPR' | 'HIPAA' | 'CCPA' | 'None';
export type DataType = 'Record' | 'Claim' | 'Result';
export type ClaimStatus = 'New' | 'In Review' | 'Paid';
export type AssetType = 'Policy' | 'Claim' | 'Model';

export interface BaseAsset {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  creationDate: string;
  piiTag: boolean;
  regTag: RegTag;
}

export interface Policy extends BaseAsset {
  type: 'Policy';
  dataType: 'Record';
}

export interface Claim extends BaseAsset {
  type: 'Claim';
  claimAmount: number;
  status: ClaimStatus;
  policyId: string;
}

export interface Model extends BaseAsset {
  type: 'Model';
  dataType: 'Result';
  sourceClaimId: string[];
}

export type Asset = Policy | Claim | Model;
