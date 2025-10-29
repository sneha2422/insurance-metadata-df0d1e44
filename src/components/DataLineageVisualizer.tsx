import { useEffect, useRef, useState } from 'react';
import { Asset } from '@/types';
import { Card } from '@/components/ui/card';

interface DataLineageVisualizerProps {
  assets: Asset[];
}

interface LineageNode {
  id: string;
  name: string;
  type: 'Policy' | 'Claim' | 'Model';
  x: number;
  y: number;
  piiTag: boolean;
}

export const DataLineageVisualizer = ({ assets }: DataLineageVisualizerProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Asset | null>(null);

  const policies = assets.filter(a => a.asset_type === 'Policy');
  const claims = assets.filter(a => a.asset_type === 'Claim');
  const models = assets.filter(a => a.asset_type === 'Model');

  const nodeWidth = 160;
  const nodeHeight = 80;
  const columnGap = 250;
  const rowGap = 120;

  const getNodeColor = (type: string) => {
    const colors = {
      Policy: 'hsl(215, 65%, 45%)',
      Claim: 'hsl(35, 85%, 55%)',
      Model: 'hsl(142, 76%, 36%)'
    };
    return colors[type as keyof typeof colors];
  };

  const renderLineage = () => {
    const nodes: LineageNode[] = [];
    const edges: Array<{ from: LineageNode; to: LineageNode }> = [];

    // Position policies
    policies.forEach((policy, i) => {
      nodes.push({
        id: policy.id,
        name: policy.name,
        type: 'Policy',
        x: 50,
        y: 50 + i * rowGap,
        piiTag: policy.pii_tag || false
      });
    });

    // Position claims and create edges to policies
    claims.forEach((claim, i) => {
      const claimNode: LineageNode = {
        id: claim.id,
        name: claim.name,
        type: 'Claim',
        x: 50 + columnGap,
        y: 50 + i * rowGap,
        piiTag: claim.pii_tag || false
      };
      nodes.push(claimNode);

      const policyNode = nodes.find(n => n.id === claim.policy_id);
      if (policyNode) {
        edges.push({ from: policyNode, to: claimNode });
      }
    });

    // Position models and create edges to claims
    models.forEach((model, i) => {
      const modelNode: LineageNode = {
        id: model.id,
        name: model.name,
        type: 'Model',
        x: 50 + columnGap * 2,
        y: 50 + i * rowGap,
        piiTag: model.pii_tag || false
      };
      nodes.push(modelNode);

      if (model.source_claim_ids) {
        model.source_claim_ids.forEach(claimId => {
          const claimNode = nodes.find(n => n.id === claimId);
          if (claimNode) {
            edges.push({ from: claimNode, to: modelNode });
          }
        });
      }
    });

    const svgHeight = Math.max(...nodes.map(n => n.y)) + nodeHeight + 50;
    const svgWidth = 50 + columnGap * 2 + nodeWidth + 50;

    return (
      <svg
        ref={svgRef}
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="bg-card rounded-lg border"
      >
        {/* Draw edges first */}
        {edges.map((edge, i) => {
          const fromX = edge.from.x + nodeWidth;
          const fromY = edge.from.y + nodeHeight / 2;
          const toX = edge.to.x;
          const toY = edge.to.y + nodeHeight / 2;
          const midX = (fromX + toX) / 2;

          return (
            <g key={`edge-${i}`}>
              <path
                d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                stroke="hsl(var(--border))"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}

        {/* Define arrowhead marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill="hsl(var(--border))"
            />
          </marker>
        </defs>

        {/* Draw nodes */}
        {nodes.map((node) => (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            className="cursor-pointer"
            onClick={() => {
              const asset = assets.find(a => a.id === node.id);
              setSelectedNode(asset || null);
            }}
          >
            <rect
              width={nodeWidth}
              height={nodeHeight}
              rx="8"
              fill={getNodeColor(node.type)}
              opacity="0.9"
              className="hover:opacity-100 transition-opacity"
            />
            <text
              x={nodeWidth / 2}
              y={nodeHeight / 2 - 10}
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontWeight="600"
            >
              {node.name.length > 18 ? node.name.substring(0, 18) + '...' : node.name}
            </text>
            <text
              x={nodeWidth / 2}
              y={nodeHeight / 2 + 8}
              textAnchor="middle"
              fill="white"
              fontSize="11"
              opacity="0.9"
            >
              {node.type}
            </text>
            {node.piiTag && (
              <text
                x={nodeWidth / 2}
                y={nodeHeight / 2 + 24}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                ⚠ PII
              </text>
            )}
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {renderLineage()}
        </div>
      </div>

      {selectedNode && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Node Details</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {selectedNode.name}</p>
            <p><strong>ID:</strong> {selectedNode.id}</p>
            <p><strong>Type:</strong> {selectedNode.asset_type}</p>
            <p><strong>PII Tag:</strong> {selectedNode.pii_tag ? 'Yes' : 'No'}</p>
            <p><strong>Regulatory Tag:</strong> {selectedNode.reg_tag || 'None'}</p>
            <p><strong>Description:</strong> {selectedNode.description || 'N/A'}</p>
          </div>
        </Card>
      )}

      {assets.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No assets to visualize. Create some assets first.</p>
        </Card>
      )}
    </div>
  );
};
