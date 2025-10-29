-- Create enum for regulatory tags
CREATE TYPE public.regulatory_tag AS ENUM ('GDPR', 'HIPAA', 'CCPA', 'None');

-- Create enum for asset types
CREATE TYPE public.asset_type AS ENUM ('Policy', 'Claim', 'Model');

-- Create enum for claim status
CREATE TYPE public.claim_status AS ENUM ('New', 'In Review', 'Paid');

-- Create enum for data types
CREATE TYPE public.data_type AS ENUM ('Record', 'Claim', 'Result');

-- Create metadata_catalog table
CREATE TABLE public.metadata_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  creation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  asset_type public.asset_type NOT NULL,
  data_type public.data_type,
  pii_tag BOOLEAN DEFAULT false,
  reg_tag public.regulatory_tag DEFAULT 'None',
  
  -- Claim-specific fields
  claim_amount NUMERIC,
  status public.claim_status,
  policy_id UUID,
  
  -- Model-specific fields
  source_claim_ids UUID[]
);

-- Enable RLS
ALTER TABLE public.metadata_catalog ENABLE ROW LEVEL SECURITY;

-- Create policies - Allow all authenticated users to read
CREATE POLICY "Anyone can view metadata catalog"
  ON public.metadata_catalog
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own assets
CREATE POLICY "Users can create their own assets"
  ON public.metadata_catalog
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Allow users to update their own assets
CREATE POLICY "Users can update their own assets"
  ON public.metadata_catalog
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Allow users to delete their own assets
CREATE POLICY "Users can delete their own assets"
  ON public.metadata_catalog
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create index for better query performance
CREATE INDEX idx_metadata_catalog_asset_type ON public.metadata_catalog(asset_type);
CREATE INDEX idx_metadata_catalog_policy_id ON public.metadata_catalog(policy_id);
CREATE INDEX idx_metadata_catalog_owner_id ON public.metadata_catalog(owner_id);