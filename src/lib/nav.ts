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
} from "lucide-react";
import type { NavItem } from "@/components/layout/Sidebar";

export const adminNav: NavItem[] = [
  { label: "Panel", href: "/admin/dashboard", icon: LayoutGrid },
  { label: "Miembros", href: "/admin/miembros", icon: Users },
  { label: "Solicitudes", href: "/admin/miembros/solicitudes", icon: ClipboardList },
  { label: "Eventos", href: "/admin/eventos", icon: CalendarDays },
  { label: "Secciones", href: "/admin/secciones", icon: Building2 },
  { label: "Administradores", href: "/admin/administradores", icon: ShieldCheck },
  { label: "Configuración", href: "/admin/configuracion", icon: Settings },
];

export const memberNav: NavItem[] = [
  { label: "Panel", href: "/member/dashboard", icon: LayoutGrid },
  { label: "Perfil", href: "/member/perfil", icon: Users },
  { label: "Membresía", href: "/member/membresia", icon: BadgeCheck },
  { label: "Eventos", href: "/member/eventos", icon: CalendarDays },
  { label: "Solicitudes", href: "/member/solicitudes", icon: ClipboardList },
  { label: "Secciones", href: "/member/secciones", icon: Building2 },
  { label: "Diplomas", href: "/member/diplomas", icon: Award },
];

export const staffNav: NavItem[] = [
  { label: "Escáner", href: "/staff/escaner", icon: QrCode },
  { label: "Validaciones", href: "/staff/validaciones", icon: FileCheck },
];
