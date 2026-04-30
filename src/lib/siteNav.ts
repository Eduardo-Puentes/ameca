export type SiteNavGroup = {
  label: string;
  items: Array<{
    label: string;
    href: string;
    description?: string;
  }>;
};

export const siteNavGroups: SiteNavGroup[] = [
  {
    label: "Conoce",
    items: [
      {
        label: "Inicio",
        href: "/",
        description: "Portada principal y consejo directivo actual.",
      },
      {
        label: "Consejo Directivo",
        href: "/#consejo-directivo-actual",
        description: "Acceso rapido al directorio del consejo actual.",
      },
    ],
  },
];
