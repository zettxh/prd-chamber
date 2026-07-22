import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';

export interface StructureNodeData {
  label: string;
  subtitle: string;
  icon: string;
  faseNumber?: number;
  subFeatures?: { name: string; description: string }[];
  isRoot?: boolean;
  [key: string]: unknown;
}

export interface StructureStore {
  nodes: Array<Node<StructureNodeData>>;
  edges: Edge[];
  selectedPhaseId: string | null;
  setSelectedPhase: (id: string | null) => void;
  selectPhase: (phaseId: string) => void;
  deselectAll: () => void;
  updateNodeLabel: (id: string, label: string) => void;
}

const initialNodes: Array<Node<StructureNodeData>> = [
  {
    id: 'root',
    type: 'rootNode',
    position: { x: 50, y: 180 },
    data: { label: 'PRD Chamber', subtitle: 'Perencanaan', icon: '📋', isRoot: true },
  },
  {
    id: 'prd-editor',
    type: 'phaseNode',
    position: { x: 300, y: 40 },
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
    position: { x: 300, y: 140 },
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
    position: { x: 300, y: 240 },
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
    position: { x: 300, y: 340 },
    data: {
      label: 'Riwayat Revisi', subtitle: 'Direncanakan', icon: '🕐', faseNumber: 4,
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
    position: { x: 300, y: 440 },
    data: {
      label: 'Akun Pengguna', subtitle: 'Direncanakan', icon: '👤', faseNumber: 5,
      subFeatures: [
        { name: 'Daftar Akun', description: 'Pendaftaran user baru' },
        { name: 'Login & Logout', description: 'Autentikasi user' },
        { name: 'Atur Ulang Kata Sandi', description: 'Reset password via email' },
      ],
    },
  },
];

const initialEdges: Edge[] = [
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

/** Build sub-feature nodes + edges for one phase */
function buildSubForPhase(
  phaseNode: Node<StructureNodeData>,
): { nodes: Array<Node<any>>; edges: Edge[] } {
  const nodes: Array<Node<any>> = [];
  const edges: Edge[] = [];

  if (phaseNode.data.isRoot || !phaseNode.data.subFeatures?.length) return { nodes, edges };

  const x = phaseNode.position.x + 280;
  const y = phaseNode.position.y - 6;

  phaseNode.data.subFeatures.forEach((sf, i) => {
    nodes.push({
      id: `${phaseNode.id}-sub-${i}`,
      type: 'subFeatureNode',
      position: { x, y: y + i * 36 },
      data: { name: sf.name, description: sf.description },
    });
    edges.push({
      id: `e-${phaseNode.id}-sub-${i}`,
      source: phaseNode.id,
      target: `${phaseNode.id}-sub-${i}`,
      type: 'smoothstep',
      animated: false,
      style: { stroke: 'var(--accent)', strokeWidth: 1.5, opacity: 1 },
    });
  });

  return { nodes, edges };
}

export const useStructureStore = create<StructureStore>((set) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedPhaseId: null,

  setSelectedPhase: (id) => set({ selectedPhaseId: id }),

  /** Klik phase → tampilkan sub-fitur + edge, sembunyikan yang lain */
  selectPhase: (phaseId: string) => {
    const phaseNode = initialNodes.find(n => n.id === phaseId);
    if (!phaseNode || phaseNode.data.isRoot || !phaseNode.data.subFeatures?.length) {
      set({ nodes: initialNodes, edges: initialEdges, selectedPhaseId: phaseId });
      return;
    }

    const { nodes: subNodes, edges: subEdges } = buildSubForPhase(phaseNode);

    const highlighted = initialNodes.map(n => ({ ...n, selected: n.id === phaseId }));
    set({
      nodes: [...highlighted, ...subNodes] as Array<Node<StructureNodeData>>,
      edges: initialEdges.concat(subEdges),
      selectedPhaseId: phaseId,
    });
  },

  deselectAll: () => {
    set({ nodes: initialNodes, edges: initialEdges, selectedPhaseId: null });
  },

  updateNodeLabel: (id, label) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label } } : n
      ),
    })),
}));
