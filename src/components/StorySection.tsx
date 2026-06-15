import './StorySection.css';

export function StorySection() {
  return (
    <section id="origem" className="story-section" aria-labelledby="story-title">
      <div className="story-heading">
        <p className="section-label">origem visual</p>
        <h2 id="story-title">Duas partes, uma assinatura.</h2>
      </div>

      <div className="story-columns">
        <article className="story-card story-card-paper">
          <span className="story-logo story-logo-feitono" role="img" aria-label="feito no" />
          <p>
            “feito no” é uma expressão de duas palavras: direta, curta e sem virar marca inventada. Aqui ela aparece em Londrina Solid, família de Marcelo Magalhães, da Tipos Pereira, criada a partir de letras desenhadas à mão em papel quadriculado e papel vegetal, com referência ao vernacular de lanchonetes, fachadas e comércio de rua; o nome Londrina veio da cidade onde Marcelo viveu.
          </p>
          <a href="https://github.com/marcelommp/Londrina-Typeface" target="_blank" rel="noreferrer">
            Fonte da Londrina
          </a>
        </article>

        <article className="story-card story-card-ink">
          <span className="story-logo story-logo-brasil" role="img" aria-label="Brasil" />
          <p>
            “Brasil” entra como assinatura de rua: mais solta, mais marcada, menos comportada. Como o desenho herda cor, o selo consegue virar verde, azul, amarelo, branco ou qualquer cor definida por quem estiver usando.
          </p>
        </article>
      </div>
    </section>
  );
}
