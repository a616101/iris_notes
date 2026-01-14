import { LucideProps } from 'lucide-react';
import {
  Search,
  Filter,
  Calendar,
  X,
  Tag,
  Clock,
  MapPin,
  Phone,
  User,
  History,
  ChevronUp,
  ChevronDown,
  BarChart3,
  FileUp,
  LogOut,
  Target,
  TrendingUp,
  FileSpreadsheet,
  Upload,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
  AlertCircle,
  Info,
  Save,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Mail,
  Video,
  Download,
  RefreshCw,
} from 'lucide-react';

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string;
  size?: number;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  'search': Search,
  'filter': Filter,
  'calendar': Calendar,
  'x': X,
  'tag': Tag,
  'clock': Clock,
  'map-pin': MapPin,
  'phone': Phone,
  'user': User,
  'history': History,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'bar-chart-3': BarChart3,
  'file-up': FileUp,
  'log-out': LogOut,
  'target': Target,
  'trending-up': TrendingUp,
  'file-spreadsheet': FileSpreadsheet,
  'upload': Upload,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'more-vertical': MoreVertical,
  'edit': Edit,
  'trash-2': Trash2,
  'plus': Plus,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertCircle,
  'info': Info,
  'save': Save,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'message-circle': MessageCircle,
  'mail': Mail,
  'video': Video,
  'download': Download,
  'refresh-cw': RefreshCw,
};

const Icon = ({ name, size = 20, className = '', ...props }: IconProps) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <IconComponent size={size} className={className} {...props} />;
};

export default Icon;
