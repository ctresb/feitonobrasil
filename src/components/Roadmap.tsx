import { roadmap } from '../data/roadmap';
import './Roadmap.css';

export function Roadmap() {
  return (
    <section id="roadmap" className="roadmap-section" aria-labelledby="roadmap-title">
      <div className="roadmap-title-block">
        <p className="section-label">mini roadmap</p>
        <h2 id="roadmap-title">Pequeno agora, útil desde já.</h2>
        <p>
          Primeiro o selo precisa ser fácil de pegar e usar. Depois entram vitrine, contador e comunidade, só se isso ajudar quem adotou.
        </p>
      </div>

      <div className="roadmap-list">
        {roadmap.map((item, index) => (
          <article className="roadmap-item" key={item.phase}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <p>{item.phase}</p>
              <h3>{item.title}</h3>
              <small>{item.detail}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
