import {
  ClipboardList,
  FileText,
  Folder,
  Wrench,
  Clock,
  User,
  Boxes,
  type LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  '📋': ClipboardList,
  '📄': FileText,
  '📁': Folder,
  '🔧': Wrench,
  '🕐': Clock,
  '👤': User,
};

/** Fallback — Boxes icon for SUB FITUR header, etc. */
export const SubGroupIcon = Boxes;
