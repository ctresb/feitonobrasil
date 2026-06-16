import { DEFAULT_BRASIL_LETTER_COLORS, buildSealUrl } from '../lib/seal';
import './Footer.css';

const sealUrl = buildSealUrl({
  language: 'pt-br',
  style: 'divertido',
  variant: 'branco',
  scale: 1,
  colorMode: 'variant',
  singleColor: '#232324',
  feitoColor: '#232324',
  brasilColor: '#009440',
  ...DEFAULT_BRASIL_LETTER_COLORS,
});

export function Footer() {
  return (
    <footer className="site-footer">
      <img src={sealUrl} alt="Feito no Brasil" />
      <p>Um selo aberto para marcar projetos, repos e produtos digitais feitos no Brasil.</p>
      <a href="https://feitonobrasil.dev.br">feitonobrasil.dev.br</a>
      <a
        className="footer-project"
        href="https://c3b.fun/?utm_source=feitonobrasil.dev.br&utm_medium=footer&utm_campaign=feito_no_brasil"
        target="_blank"
        rel="noreferrer"
      >
        <span>um projeto de</span>
        <img src="/c3b.png" alt="C3B" />
      </a>
    </footer>
  );
}
