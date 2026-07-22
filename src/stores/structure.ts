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
  deselectAll: () => void;
  updateNodeLabel: (id: string, label: string) => void;
}

const initialNodes: Array<Node<StructureNodeData>> = [
  {
    id: 'root',
    type: 'rootNode',
    position: { x: 30, y: 200 },
    data: { label: 'PRD Chamber', subtitle: 'Perencanaan', icon: '📋', isRoot: true },
  },
  {
    id: 'prd-editor',
    type: 'phaseNode',
    position: { x: 300, y: 30 },
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
    position: { x: 300, y: 250 },
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
    position: { x: 300, y: 360 },
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
    position: { x: 300, y: 470 },
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

/** Build all sub-feature nodes + edges upfront for all phases */
function buildAllSubFeatures(): { nodes: Array<Node<any>>; edges: Edge[] } {
  const nodes: Array<Node<any>> = [];
  const edges: Edge[] = [];

  for (const phase of initialNodes) {
    if (phase.data.isRoot || !phase.data.subFeatures?.length) continue;
    const x = phase.position.x + 280;
    const y = phase.position.y;

    phase.data.subFeatures.forEach((sf, i) => {
      nodes.push({
        id: `${phase.id}-sub-${i}`,
        type: 'subFeatureNode',
        position: { x, y: y + i * 38 },
        data: { name: sf.name, description: sf.description },
      });
      edges.push({
        id: `e-${phase.id}-sub-${i}`,
        source: phase.id,
        target: `${phase.id}-sub-${i}`,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--accent-dim)', strokeWidth: 1.5, opacity: 0.7 },
      });
    });
  }

  return { nodes, edges };
}

const { nodes: subNodes, edges: subEdges } = buildAllSubFeatures();
const fullNodes: Array<Node<StructureNodeData>> = [...initialNodes, ...subNodes] as Array<Node<StructureNodeData>>;
const fullEdges: Edge[] = [...initialEdges, ...subEdges];

export const useStructureStore = create<StructureStore>((set) => ({
  nodes: fullNodes,
  edges: fullEdges,
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

  updateNodeLabel: (id, label) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label } } : n
      ),
    })),
}));
