import './Hero.css';

export function Hero() {
  return (
    <section id="topo" className="hero-section" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="section-label">selo aberto para brdevs</p>
        <h1 id="hero-title">Feito no Brasil</h1>
        <p className="hero-lede">
          Um selo simples para marcar READMEs, sites, bibliotecas e produtos digitais criados por devs brasileiros.
        </p>
        <div className="hero-actions" aria-label="Ações principais">
          <a className="button button-primary" href="#editor" data-primary-cta>
            Personalize seu selo
          </a>
          <a className="button button-quiet" href="#pre-prontos">
            Ver selos prontos
          </a>
        </div>
      </div>
    </section>
  );
}
