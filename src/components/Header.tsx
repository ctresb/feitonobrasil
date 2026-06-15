import { buildSealUrl } from '../lib/seal';
import './Header.css';

const sealUrl = buildSealUrl({
  language: 'pt-br',
  variant: 'colorido',
  scale: 1,
  colorMode: 'variant',
  singleColor: '#232324',
  feitoColor: '#232324',
  brasilColor: '#009440',
});

const navItems = [
  { href: '#topo', label: 'Início' },
  { href: '#origem', label: 'Origem' },
  { href: '#pre-prontos', label: 'Selos prontos' },
  { href: '#editor', label: 'Editor' },
];

export function Header() {
  return (
    <header className="site-header" aria-label="Topo">
      <a className="brand-mark" href="#topo" aria-label="Feito no Brasil, voltar ao topo">
        <img src={sealUrl} alt="" />
      </a>

      <nav className="site-nav" aria-label="Navegação principal">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
