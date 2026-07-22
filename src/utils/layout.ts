import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

/** Estimated node dimensions for layout calculation */
const NODE_DIMS: Record<string, { width: number; height: number }> = {
  rootNode: { width: 220, height: 70 },
  phaseNode: { width: 280, height: 85 },
  subFeatureGroupNode: { width: 260, height: 150 },
};

const DEFAULT_DIM = { width: 200, height: 60 };

/**
 * Compute auto-layout positions for all nodes using Dagre.
 * Returns a new nodes array with calculated positions.
 * Edge routing is left to React Flow's smoothstep.
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'LR',
    ranksep: 120,
    nodesep: 60,
    edgesep: 20,
    marginx: 40,
    marginy: 40,
  });

  // Add nodes with dimensions
  for (const node of nodes) {
    const dim = NODE_DIMS[node.type ?? ''] ?? DEFAULT_DIM;
    g.setNode(node.id, { width: dim.width, height: dim.height });
  }

  // Add edges
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  // Apply computed positions
  return nodes.map(node => {
    const dagreNode = g.node(node.id);
    const dim = NODE_DIMS[node.type ?? ''] ?? DEFAULT_DIM;

    // Dagre gives center position; React Flow needs top-left
    const x = dagreNode.x - dim.width / 2;
    const y = dagreNode.y - dim.height / 2;

    return {
      ...node,
      position: { x, y },
    };
  });
}
