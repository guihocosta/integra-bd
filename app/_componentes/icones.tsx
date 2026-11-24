// Ícones de traço simples, no estilo dos protótipos.

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export const IconeGrade = () => (
  <svg {...base}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const IconeAtividades = () => (
  <svg {...base}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
);

export const IconeEnviar = () => (
  <svg {...base}>
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
  </svg>
);

export const IconeLivro = () => (
  <svg {...base}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
  </svg>
);

export const IconeMais = () => (
  <svg {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconeFiltro = () => (
  <svg {...base} width={14} height={14}>
    <path d="M3 6h18M7 12h10M10 18h4" />
  </svg>
);

export const IconeArquivo = () => (
  <svg {...base}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 15h6" />
  </svg>
);

export const IconeFechar = () => (
  <svg {...base}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
