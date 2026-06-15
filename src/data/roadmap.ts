export type RoadmapItem = {
  phase: string;
  title: string;
  detail: string;
};

export const roadmap: RoadmapItem[] = [
  {
    phase: 'agora',
    title: 'Selo pronto para copiar',
    detail: 'SVGs, URLs parametrizadas e snippets para README, HTML, React e mais alguns usos comuns.',
  },
  {
    phase: 'próximo',
    title: 'Vitrine de quem usa',
    detail: 'Uma lista simples de projetos brasileiros, com link, stack e contexto curto.',
  },
  {
    phase: 'quando fizer sentido',
    title: 'Adoção e comunidade',
    detail: 'Contador público, envio voluntário de projetos e um espaço leve para manter o selo vivo.',
  },
];
