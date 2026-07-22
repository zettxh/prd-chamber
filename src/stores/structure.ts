import { create } from 'zustand';
import type { Node, Edge, NodeChange } from '@xyflow/react';
import { applyNodeChanges } from '@xyflow/react';
import { getLayoutedElements } from '../utils/layout';

export interface StructureNodeData {
  label: string;
  subtitle: string;
  icon: string;
  faseNumber?: number;
  subFeatures?: { name: string; description: string }[];
  isRoot?: boolean;
  features?: { name: string; description: string }[];
  phaseId?: string;
  [key: string]: unknown;
}

export interface PhaseJson {
  phase_name: string;
  phase_number: number;
  features: { name: string; description: string; complexity?: string; sub_features?: string[] }[];
}

export interface StructureStore {
  nodes: Array<Node<StructureNodeData>>;
  edges: Edge[];
  selectedPhaseId: string | null;
  setSelectedPhase: (id: string | null) => void;
  deselectAll: () => void;
  updateNodeLabel: (id: string, label: string) => void;
  updateSubFeature: (phaseId: string, index: number, name: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  resetLayout: () => void;
  replaceStructure: (phases: PhaseJson[]) => void;
}

// ============================================================
// DATA SOURCE — mutable module-scope constants
// ============================================================

const phaseData: Array<Node<StructureNodeData>> = [
  {
    id: 'root',
    type: 'rootNode',
    position: { x: 0, y: 0 },
    data: { label: 'PRD Chamber', subtitle: 'Perencanaan', icon: '📋', isRoot: true },
  },
  {
    id: 'prd-editor',
    type: 'phaseNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'PRD Editor', subtitle: 'Direncanakan', icon: '📄', faseNumber: 1,
      subFeatures: [
        { name: 'Edit Judul Proyek', description: 'Ubah judul proyek kapan saja' },
        { name: 'Kelola Daftar Fitur', description: 'CRUD fitur produk' },
        { name: 'Tulis Deskripsi', description: 'Deskripsi panjang dengan Markdown' },
      ],
    },
  },
  {
    id: 'manajemen-proyek',
    type: 'phaseNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Manajemen Proyek', subtitle: 'Direncanakan', icon: '📁', faseNumber: 2,
      subFeatures: [
        { name: 'Daftar Proyek', description: 'List semua proyek dengan status' },
        { name: 'Buat Proyek Baru', description: 'Form input ide kasar' },
        { name: 'Arsip Proyek', description: 'Arsipkan proyek lama' },
      ],
    },
  },
  {
    id: 'template-prd',
    type: 'phaseNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Template PRD', subtitle: 'Direncanakan', icon: '🔧', faseNumber: 3,
      subFeatures: [
        { name: 'Jelajah Template', description: 'Browse template PRD' },
        { name: 'Terapkan Template', description: 'Apply template ke proyek' },
        { name: 'Simpan Template Kustom', description: 'Buat dan simpan template sendiri' },
      ],
    },
  },
  {
    id: 'riwayat-revisi',
    type: 'phaseNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Riwayat Revisi', subtitle: 'Direncanakan', icon: '🕐', faseNumber: 3,
      subFeatures: [
        { name: 'Log Perubahan', description: 'Riwayat edit per section' },
        { name: 'Bandingkan Versi', description: 'Diff dua versi PRD' },
        { name: 'Pulihkan Versi', description: 'Restore versi sebelumnya' },
      ],
    },
  },
  {
    id: 'akun-pengguna',
    type: 'phaseNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Akun Pengguna', subtitle: 'Direncanakan', icon: '👤', faseNumber: 4,
      subFeatures: [
        { name: 'Daftar Akun', description: 'Pendaftaran user baru' },
        { name: 'Login & Logout', description: 'Autentikasi user' },
        { name: 'Atur Ulang Kata Sandi', description: 'Reset password via email' },
      ],
    },
  },
];

// ============================================================
// BUILDERS — recompute nodes + edges from data source
// ============================================================

const phaseEdgesDef: Edge[] = [
  { id: 'e-root-prd-editor', source: 'root', target: 'prd-editor', type: 'smoothstep', animated: false,
    style: { stroke: 'var(--text-secondary)', strokeWidth: 2, opacity: 0.5 } },
  { id: 'e-root-manajemen-proyek', source: 'root', target: 'manajemen-proyek', type: 'smoothstep', animated: false,
    style: { stroke: 'var(--text-secondary)', strokeWidth: 2, opacity: 0.5 } },
  { id: 'e-root-template-prd', source: 'root', target: 'template-prd', type: 'smoothstep', animated: false,
    style: { stroke: 'var(--text-secondary)', strokeWidth: 2, opacity: 0.5 } },
  { id: 'e-root-riwayat-revisi', source: 'root', target: 'riwayat-revisi', type: 'smoothstep', animated: false,
    style: { stroke: 'var(--text-secondary)', strokeWidth: 2, opacity: 0.5 } },
  { id: 'e-root-akun-pengguna', source: 'root', target: 'akun-pengguna', type: 'smoothstep', animated: false,
    style: { stroke: 'var(--text-secondary)', strokeWidth: 2, opacity: 0.5 } },
];

function buildSubFeatureGroups(): { nodes: Array<Node<any>>; edges: Edge[] } {
  const nodes: Array<Node<any>> = [];
  const edges: Edge[] = [];

  for (const phase of phaseData) {
    if (phase.data.isRoot || !phase.data.subFeatures?.length) continue;

    nodes.push({
      id: `${phase.id}-group`,
      type: 'subFeatureGroupNode',
      position: { x: 0, y: 0 },
      data: { features: phase.data.subFeatures, phaseId: phase.id },
    });
    edges.push({
      id: `e-${phase.id}-group`,
      source: phase.id,
      target: `${phase.id}-group`,
      type: 'smoothstep',
      animated: false,
      style: { stroke: 'var(--accent-dim)', strokeWidth: 1.5, opacity: 0.7 },
    });
  }

  return { nodes, edges };
}

function computeLayout() {
  const { nodes: groupNodes, edges: groupEdges } = buildSubFeatureGroups();
  const rawNodes = [...phaseData, ...groupNodes];
  const rawEdges = [...phaseEdgesDef, ...groupEdges];

  try {
    return {
      nodes: getLayoutedElements(rawNodes, rawEdges) as Array<Node<StructureNodeData>>,
      edges: rawEdges,
    };
  } catch (e) {
    console.error('Dagre layout failed, using raw positions:', e);
    return { nodes: rawNodes as Array<Node<StructureNodeData>>, edges: rawEdges };
  }
}

const initialLayout = computeLayout();

// ============================================================
// STORE
// ============================================================

export const useStructureStore = create<StructureStore>((set) => ({
  nodes: initialLayout.nodes,
  edges: initialLayout.edges,
  selectedPhaseId: null,

  setSelectedPhase: (id) => {
    if (!id) {
      set((s) => ({
        selectedPhaseId: null,
        nodes: s.nodes.map(n => ({ ...n, selected: false })),
        edges: s.edges.map(e => ({
          ...e,
          style: { ...e.style, stroke: 'var(--accent-dim)', opacity: 0.7 },
        })),
      }));
      return;
    }
    set((s) => ({
      selectedPhaseId: id,
      nodes: s.nodes.map(n => ({ ...n, selected: n.id === id })),
      edges: s.edges.map(e => ({
        ...e,
        style: {
          ...e.style,
          stroke: e.source === id ? 'var(--accent)' : 'var(--accent-dim)',
          opacity: e.source === id ? 1 : 0.5,
        },
      })),
    }));
  },

  deselectAll: () => {
    set((s) => ({
      selectedPhaseId: null,
      nodes: s.nodes.map(n => ({ ...n, selected: false })),
      edges: s.edges.map(e => ({
        ...e,
        style: { ...e.style, stroke: 'var(--accent-dim)', opacity: 0.7 },
      })),
    }));
  },

  updateNodeLabel: (id, label) => {
    // Update data source
    const phase = phaseData.find(p => p.id === id);
    if (phase) phase.data.label = label;
    // Update store state (preserve positions)
    set((s) => ({
      nodes: s.nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, label } } : n
      ),
    }));
  },

  updateSubFeature: (phaseId, index, name) => {
    // Update data source
    const phase = phaseData.find(p => p.id === phaseId);
    if (!phase?.data.subFeatures?.[index]) return;
    phase.data.subFeatures[index].name = name;
    const sf = phase.data.subFeatures; // narrowed reference
    const featuresCopy = [...sf];
    // Update store state — rebuild group node's features array (preserve positions)
    set((s) => ({
      nodes: s.nodes.map(n => {
        if (n.id === `${phaseId}-group` && n.data.features) {
          return {
            ...n,
            data: { ...n.data, features: featuresCopy },
          };
        }
        return n;
      }),
    }));
  },

  /** Controlled mode — React Flow calls this on every drag/pan/select */
  onNodesChange: (changes) => {
    set((s) => {
      const next = applyNodeChanges(changes, s.nodes) as Array<Node<StructureNodeData>>;

      // Sync SubFeatureGroupNode positions when PhaseNode is dragged
      const synced = next.map(node => {
        if (node.type === 'phaseNode') {
          const groupNode = next.find(n => n.id === `${node.id}-group`);
          if (groupNode) {
            // Keep group node offset relative to phase node
            const deltaX = 310; // approximate rightward offset
            const deltaY = 0;
            groupNode.position = {
              x: node.position.x + deltaX,
              y: node.position.y + deltaY,
            };
          }
        }
        return node;
      });

      return { nodes: synced };
    });
  },

  /** Reset all positions to Dagre auto-layout */
  resetLayout: () => {
    set({ ...computeLayout(), selectedPhaseId: null });
  },

  replaceStructure: (phases) => {
    console.log('replaceStructure called with:', phases);
  },
}));
