import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Roadmap } from './components/Roadmap';
import { SealBuilder } from './components/SealBuilder';
import { SealShowcase } from './components/SealShowcase';
import { StorySection } from './components/StorySection';
import './styles/page.css';

export function App() {
  return (
    <>
      <Header />
      <main id="conteudo" className="page-shell">
        <Hero />
        <SealShowcase />
        <StorySection />
        <Roadmap />
        <SealBuilder />
      </main>
      <Footer />
    </>
  );
}
