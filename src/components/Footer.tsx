import './Footer.css';

export function Footer() {
  return (
    <footer className="site-footer">
      <img src="/selos/feitonobrasil_branco.svg" alt="Feito no Brasil" />
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
