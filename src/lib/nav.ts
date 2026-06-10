import {
  LayoutGrid,
  Users,
  CalendarDays,
  Building2,
  Settings,
  FileCheck,
  ShieldCheck,
  ClipboardList,
  QrCode,
  BadgeCheck,
  Award,
  Upload,
} from "lucide-react";
import type { NavItem } from "@/components/layout/Sidebar";

export const adminNav: NavItem[] = [
  { label: "Panel", href: "/admin/dashboard", icon: LayoutGrid },
  { label: "Socios", href: "/admin/socios", icon: Users },
  { label: "Importar socios", href: "/admin/socios/importar", icon: Upload },
  { label: "Solicitudes", href: "/admin/socios/solicitudes", icon: ClipboardList },
  { label: "Eventos", href: "/admin/eventos", icon: CalendarDays },
  { label: "Secciones estudiantiles", href: "/admin/secciones", icon: Building2 },
  { label: "Administradores", href: "/admin/administradores", icon: ShieldCheck },
  { label: "Configuración", href: "/admin/configuracion", icon: Settings },
];

export const memberNav: NavItem[] = [
  { label: "Panel", href: "/socio/dashboard", icon: LayoutGrid },
  { label: "Perfil", href: "/socio/perfil", icon: Users },
  { label: "Membresía", href: "/socio/membresia", icon: BadgeCheck },
  { label: "Eventos", href: "/socio/eventos", icon: CalendarDays },
  { label: "Solicitudes", href: "/socio/solicitudes", icon: ClipboardList },
  { label: "Secciones estudiantiles", href: "/socio/secciones", icon: Building2 },
  { label: "Diplomas", href: "/socio/diplomas", icon: Award },
];

export const staffNav: NavItem[] = [
  { label: "Escáner", href: "/staff/escaner", icon: QrCode },
  { label: "Validaciones", href: "/staff/validaciones", icon: FileCheck },
];
