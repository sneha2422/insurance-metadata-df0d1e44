import { useMemo } from 'react';
import { Asset, Claim, Policy } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

interface FraudDashboardProps {
  assets: Asset[];
}

export const FraudDashboard = ({ assets }: FraudDashboardProps) => {
  const claims = assets.filter(a => a.type === 'Claim') as Claim[];
  const policies = assets.filter(a => a.type === 'Policy') as Policy[];

  const calculateFraudScore = (claim: Claim): boolean => {
    if (claim.claimAmount <= 5000) return false;

    const policy = policies.find(p => p.id === claim.policyId);
    if (!policy) return false;

    const policyDate = new Date(policy.creationDate);
    const claimDate = new Date(claim.creationDate);
    const daysDiff = Math.floor((claimDate.getTime() - policyDate.getTime()) / (1000 * 60 * 60 * 24));

    return daysDiff < 90;
  };

  const { totalClaims, suspiciousClaims, fraudPercentage } = useMemo(() => {
    const total = claims.length;
    const suspicious = claims.filter(calculateFraudScore);
    const percentage = total > 0 ? (suspicious.length / total * 100).toFixed(1) : '0';

    return {
      totalClaims: total,
      suspiciousClaims: suspicious.length,
      fraudPercentage: percentage
    };
  }, [claims, policies]);

  const claimsWithFraudStatus = useMemo(() => {
    return claims.map(claim => ({
      ...claim,
      isSuspicious: calculateFraudScore(claim)
    }));
  }, [claims, policies]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Claims</p>
              <p className="text-3xl font-bold">{totalClaims}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-destructive/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Suspicious Claims</p>
              <p className="text-3xl font-bold text-destructive">{suspiciousClaims}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Fraud Rate</p>
              <p className="text-3xl font-bold">{fraudPercentage}%</p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              parseFloat(fraudPercentage) > 20 
                ? 'bg-destructive/10' 
                : 'bg-success/10'
            }`}>
              <AlertCircle className={`h-6 w-6 ${
                parseFloat(fraudPercentage) > 20 
                  ? 'text-destructive' 
                  : 'text-success'
              }`} />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Claims Analysis</h3>
          
          {claimsWithFraudStatus.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No claims available for analysis.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Claim Name</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Fraud Status</th>
                    <th className="text-left py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {claimsWithFraudStatus.map((claim) => (
                    <tr key={claim.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{claim.name}</td>
                      <td className="py-3 px-4">
                        ${claim.claimAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{claim.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        {claim.isSuspicious ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Suspicious
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/20">
                            <CheckCircle className="h-3 w-3" />
                            OK
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(claim.creationDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-muted/30">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Fraud Detection Rules</h4>
            <p className="text-sm text-muted-foreground">
              A claim is flagged as <strong>Suspicious</strong> if:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
              <li>Claim amount exceeds $5,000</li>
              <li>Claim was filed within 90 days of policy creation</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
