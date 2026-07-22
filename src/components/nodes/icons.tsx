import {
  ClipboardList,
  FileText,
  Folder,
  Wrench,
  Clock,
  User,
  Boxes,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  '📋': ClipboardList,
  '📄': FileText,
  '📁': Folder,
  '🔧': Wrench,
  '🕐': Clock,
  '👤': User,
};

export const SubGroupIcon = Boxes;
