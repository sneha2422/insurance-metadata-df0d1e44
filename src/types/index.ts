export type RegulatoryTag = 'GDPR' | 'HIPAA' | 'CCPA' | 'None';
export type AssetType = 'Policy' | 'Claim' | 'Model';
export type ClaimStatus = 'New' | 'In Review' | 'Paid';
export type DataType = 'Record' | 'Claim' | 'Result';

export interface Asset {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  creation_date: string;
  asset_type: AssetType;
  data_type?: DataType;
  pii_tag?: boolean;
  reg_tag?: RegulatoryTag;
  
  // Claim-specific fields
  claim_amount?: number;
  status?: ClaimStatus;
  policy_id?: string;
  
  // Model-specific fields
  source_claim_ids?: string[];
}
