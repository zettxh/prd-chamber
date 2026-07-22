import { RootNode } from './RootNode';
import { PhaseNode } from './PhaseNode';
import { SubFeatureNode } from './SubFeatureNode';

export const nodeTypes = {
  rootNode: RootNode,
  phaseNode: PhaseNode,
  subFeatureNode: SubFeatureNode,
} as const;
