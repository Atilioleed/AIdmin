export type AgentKey = 'ceo' | 'marketing' | 'finanzas' | 'producto' | 'legal' | 'desarrollo';

export const AGENTS: { key: AgentKey; name: string; role: string; description: string }[] = [
  {
    key: 'ceo',
    name: 'Gerente General',
    role: 'Preside el comité',
    description:
      'Cruza los reportes de cada gerencia, prioriza y arma la pauta del día. Lo que implica plata o contenido público pasa por tu aprobación antes de moverse.',
  },
  {
    key: 'marketing',
    name: 'Marketing',
    role: 'Redes y contenido',
    description:
      'Conectado a tus redes sociales y a Metricool. Propone y prepara contenido — nada se publica sin que un humano lo revise primero.',
  },
  {
    key: 'finanzas',
    name: 'Finanzas',
    role: 'Flujo y aprobaciones',
    description:
      'Vigila el flujo de caja y prepara cada gasto para tu firma. Ningún movimiento de dinero real sale sin aprobación humana explícita.',
  },
  {
    key: 'producto',
    name: 'Producto',
    role: 'Mercado y competencia',
    description:
      'Sale a internet a investigar competidores, precios y tendencias de tu rubro, y trae oportunidades concretas al comité.',
  },
  {
    key: 'legal',
    name: 'Legal',
    role: 'Documentos y cumplimiento',
    description:
      'Redacta y revisa contratos, términos y documentos legales de tu negocio, siempre dentro de los límites que tú defines.',
  },
  {
    key: 'desarrollo',
    name: 'Desarrollo',
    role: 'Producto digital',
    description:
      'Mantiene y mejora tus herramientas digitales — features, bugs y la infraestructura que hace funcionar todo lo demás.',
  },
];

export function AgentIcon({ agent, size = 22 }: { agent: AgentKey; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' } as const;
  switch (agent) {
    case 'ceo':
      return (
        <svg {...common}>
          <path d="M12 3 4 6.5v5c0 5 3.4 8.4 8 9.5 4.6-1.1 8-4.5 8-9.5v-5L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 12.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'marketing':
      return (
        <svg {...common}>
          <path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M16 9.2a4 4 0 0 1 0 5.6M18.7 6.5a8 8 0 0 1 0 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'finanzas':
      return (
        <svg {...common}>
          <path d="M4 19h16M7 19v-6M12 19V7M17 19v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'producto':
      return (
        <svg {...common}>
          <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="M15 15l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'legal':
      return (
        <svg {...common}>
          <path d="M12 3v18M7 7l-3.5 6.5a3.5 3.5 0 0 0 7 0L7 7ZM17 7l-3.5 6.5a3.5 3.5 0 0 0 7 0L17 7ZM4 21h16M4.5 7h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'desarrollo':
      return (
        <svg {...common}>
          <path d="M9 8 4.5 12 9 16M15 8l4.5 4-4.5 4M13.5 6l-3 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
