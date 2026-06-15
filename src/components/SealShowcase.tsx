import { useState } from 'react';
import { DEFAULT_BRASIL_LETTER_COLORS, buildSealUrl, type SealOptions } from '../lib/seal';
import './SealShowcase.css';

const baseOptions: SealOptions = {
  language: 'pt-br',
  variant: 'colorido',
  scale: 1,
  colorMode: 'variant',
  singleColor: '#232324',
  feitoColor: '#232324',
  brasilColor: '#009440',
  ...DEFAULT_BRASIL_LETTER_COLORS,
};

const seals: Array<{ label: string; detail: string; options: SealOptions; dark?: boolean }> = [
  {
    label: 'PT-BR colorido',
    detail: 'Fundo claro',
    options: { ...baseOptions, language: 'pt-br', variant: 'colorido' },
  },
  {
    label: 'PT-BR branco',
    detail: 'Fundo escuro',
    options: { ...baseOptions, language: 'pt-br', variant: 'branco' },
    dark: true,
  },
  {
    label: 'EN colorido',
    detail: 'Fundo claro',
    options: { ...baseOptions, language: 'en', variant: 'colorido' },
  },
  {
    label: 'EN branco',
    detail: 'Fundo escuro',
    options: { ...baseOptions, language: 'en', variant: 'branco' },
    dark: true,
  },
];

export function SealShowcase() {
  const [copiedSeal, setCopiedSeal] = useState('');

  async function copySealUrl(label: string, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSeal(label);
    } catch {
      setCopiedSeal('');
    }

    window.setTimeout(() => setCopiedSeal(''), 1600);
  }

  return (
    <section id="pre-prontos" className="seal-section" aria-labelledby="seal-title">
      <div className="seal-intro">
        <p className="section-label">pré-prontos</p>
        <h2 id="seal-title">Escolha, copie e cole.</h2>
        <p>
          Use no rodapé do site, no README do repo, na doc ou na página do produto sem precisar abrir ferramenta nenhuma.
        </p>
      </div>

      <div className="seal-grid" aria-label="Variações do selo">
        {seals.map((seal) => (
          <article className={seal.dark ? 'seal-tile seal-tile-dark' : 'seal-tile'} key={seal.label}>
            <div>
              <span>{seal.label}</span>
              <small>{seal.detail}</small>
            </div>
            <img src={buildSealUrl(seal.options)} alt={`Selo Feito no Brasil, variação ${seal.label}`} />
            <button type="button" onClick={() => copySealUrl(seal.label, buildSealUrl(seal.options))}>
              {copiedSeal === seal.label ? 'Copiado' : 'Copiar URL'}
            </button>
          </article>
        ))}
      </div>

      <div className="seal-cta">
        <p>Quer mudar idioma, tamanho ou cor?</p>
        <a className="button button-primary" href="#editor">
          Personalize o selo
        </a>
      </div>
    </section>
  );
}
