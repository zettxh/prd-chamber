import { RootNode } from './RootNode';
import { PhaseNode } from './PhaseNode';
import { SubFeatureGroupNode } from './SubFeatureGroupNode';

export const nodeTypes = {
  rootNode: RootNode,
  phaseNode: PhaseNode,
  subFeatureGroupNode: SubFeatureGroupNode,
} as const;
