import { useEffect, useMemo, useState } from 'react';
import {
  LANGUAGE_OPTIONS,
  SCALE_OPTIONS,
  VARIANT_OPTIONS,
  buildSealUrl,
  getSealAlt,
  getSealAssetPath,
  getSnippet,
  normalizeHexColor,
  type ColorMode,
  type PictureFallback,
  type SealOptions,
  type SealScale,
  type SealVariant,
  type SnippetKind,
} from '../lib/seal';
import { recolorSealSvg } from '../lib/sealSvg';
import './SealBuilder.css';

const DEFAULT_OPTIONS: SealOptions = {
  language: 'pt-br',
  variant: 'colorido',
  scale: 1,
  colorMode: 'variant',
  singleColor: '#232324',
  feitoColor: '#232324',
  brasilColor: '#009440',
};

const colorModes: Array<{ value: ColorMode; label: string }> = [
  { value: 'variant', label: 'Variação' },
  { value: 'single', label: 'Cor única' },
  { value: 'split', label: 'Duas cores' },
];

const snippetTabs: Array<{ value: SnippetKind; label: string }> = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
  { value: 'picture', label: 'Picture (HTML)' },
  { value: 'readme', label: 'README' },
  { value: 'react', label: 'React' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JS' },
  { value: 'iframe', label: 'Iframe' },
];

const quickFormats: Array<{ value: Extract<SnippetKind, 'markdown' | 'html'>; label: string }> = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
];

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function SealBuilder() {
  const [mode, setMode] = useState<'quick' | 'custom'>('quick');
  const [options, setOptions] = useState<SealOptions>(DEFAULT_OPTIONS);
  const [activeSnippet, setActiveSnippet] = useState<SnippetKind>('markdown');
  const [quickFormat, setQuickFormat] = useState<'markdown' | 'html'>('markdown');
  const [baseSvg, setBaseSvg] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');
  const [darkVariant, setDarkVariant] = useState<SealVariant>('branco-colorido');
  const [pictureFallback, setPictureFallback] = useState<PictureFallback>('light');

  // Quick mode is always the colorido seal that adapts to light/dark — only language is exposed.
  const effectiveOptions = useMemo<SealOptions>(
    () =>
      mode === 'quick'
        ? { ...DEFAULT_OPTIONS, language: options.language, autoTheme: true }
        : options,
    [mode, options],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetch(getSealAssetPath(effectiveOptions.language), { signal: controller.signal })
      .then((response) => response.text())
      .then(setBaseSvg)
      .catch(() => setBaseSvg(''));

    return () => controller.abort();
  }, [effectiveOptions.language]);

  const previewSrc = useMemo(() => {
    if (!baseSvg) {
      return buildSealUrl(effectiveOptions);
    }

    return svgDataUrl(recolorSealSvg(baseSvg, effectiveOptions));
  }, [baseSvg, effectiveOptions]);

  const pictureDarkOptions = useMemo<SealOptions>(
    () => ({
      ...effectiveOptions,
      variant: darkVariant,
      colorMode: 'variant',
    }),
    [effectiveOptions, darkVariant],
  );

  const snippetKind = mode === 'quick' ? quickFormat : activeSnippet;
  const snippet = useMemo(
    () => getSnippet(snippetKind, effectiveOptions, pictureDarkOptions, pictureFallback),
    [snippetKind, effectiveOptions, pictureDarkOptions, pictureFallback],
  );
  const sealUrl = useMemo(() => buildSealUrl(effectiveOptions), [effectiveOptions]);

  const previewBg = useMemo(() => {
    if (effectiveOptions.colorMode === 'variant' && (effectiveOptions.variant === 'branco' || effectiveOptions.variant === 'branco-colorido')) {
      return 'var(--ink)';
    }
    if (effectiveOptions.colorMode === 'single' && normalizeHexColor(effectiveOptions.singleColor, '') === '#ffffff') {
      return 'var(--ink)';
    }
    return undefined;
  }, [effectiveOptions.colorMode, effectiveOptions.variant, effectiveOptions.singleColor]);

  function updateOptions(patch: Partial<SealOptions>) {
    setOptions((current) => ({ ...current, ...patch }));
  }

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopyState('success');
    } catch {
      setCopyState('error');
    }

    window.setTimeout(() => setCopyState('idle'), 1700);
  }

  return (
    <section id="editor" className="builder-section" aria-labelledby="builder-title">
      <div className="builder-heading">
        <p className="section-label">{mode === 'quick' ? 'adicionar' : 'personalizar'}</p>
        <h2 id="builder-title">
          {mode === 'quick' ? 'Copia uma linha e pronto.' : 'Monta o selo e copia o código.'}
        </h2>
        {mode === 'quick' ? (
          <p className="builder-subtitle">Adapta sozinho ao tema claro ou escuro do leitor.</p>
        ) : null}
      </div>

      <div className="builder-layout">
        <div className="builder-left">
          <div className="builder-preview" style={{ background: previewBg }} aria-label="Preview do selo">
            <img src={previewSrc} alt={getSealAlt(effectiveOptions.language)} />
            <span>{sealUrl}</span>
          </div>

          <div className="builder-controls" aria-label="Controles do selo">
            <div className="control-row">
              <span>Idioma</span>
              <div className="segmented-control">
                {LANGUAGE_OPTIONS.map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    aria-pressed={options.language === item.value}
                    onClick={() => updateOptions({ language: item.value })}
                  >
                    {item.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'custom' ? (
              <>
                <div className="control-row">
                  <span>Cor</span>
                  <div className="segmented-control">
                    {colorModes.map((modeOption) => (
                      <button
                        type="button"
                        key={modeOption.value}
                        aria-pressed={options.colorMode === modeOption.value}
                        onClick={() => updateOptions({ colorMode: modeOption.value, variant: modeOption.value === 'variant' ? 'colorido' : 'custom' })}
                      >
                        {modeOption.label}
                      </button>
                    ))}
                  </div>
                </div>

                {options.colorMode === 'variant' ? (
                  <div className="variant-grid" aria-label="Variações prontas">
                    {VARIANT_OPTIONS.map((variant) => (
                      <button
                        type="button"
                        key={variant.value}
                        aria-pressed={options.variant === variant.value}
                        onClick={() => updateOptions({ variant: variant.value as SealVariant })}
                      >
                        <i style={{ backgroundColor: variant.tone }} />
                        {variant.label}
                      </button>
                    ))}
                  </div>
                ) : null}

                {options.colorMode === 'single' ? (
                  <label className="color-field">
                    <span>Cor única</span>
                    <input
                      type="color"
                      value={options.singleColor}
                      onChange={(event) => updateOptions({ singleColor: event.target.value })}
                    />
                    <b>{options.singleColor}</b>
                  </label>
                ) : null}

                {options.colorMode === 'split' ? (
                  <div className="split-color-grid">
                    <label className="color-field">
                      <span>Feito no</span>
                      <input
                        type="color"
                        value={options.feitoColor}
                        onChange={(event) => updateOptions({ feitoColor: event.target.value })}
                      />
                      <b>{options.feitoColor}</b>
                    </label>
                    <label className="color-field">
                      <span>Brasil</span>
                      <input
                        type="color"
                        value={options.brasilColor}
                        onChange={(event) => updateOptions({ brasilColor: event.target.value })}
                      />
                      <b>{options.brasilColor}</b>
                    </label>
                  </div>
                ) : null}

                {activeSnippet === 'picture' ? (
                  <div className="picture-dark-controls" aria-label="Configuração do tema escuro">
                    <div className="control-row">
                      <span>Tema escuro</span>
                      <div className="segmented-control">
                        {VARIANT_OPTIONS.map((variant) => (
                          <button
                            type="button"
                            key={variant.value}
                            aria-pressed={darkVariant === variant.value}
                            onClick={() => setDarkVariant(variant.value as SealVariant)}
                          >
                            {variant.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="control-row">
                      <span>Fallback</span>
                      <div className="segmented-control">
                        <button
                          type="button"
                          aria-pressed={pictureFallback === 'light'}
                          onClick={() => setPictureFallback('light')}
                        >
                          Claro
                        </button>
                        <button
                          type="button"
                          aria-pressed={pictureFallback === 'dark'}
                          onClick={() => setPictureFallback('dark')}
                        >
                          Escuro
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="scale-control">
                  <span>Tamanho</span>
                  <div className="scale-options">
                    {SCALE_OPTIONS.map((item) => (
                      <button
                        type="button"
                        key={item.label}
                        aria-pressed={options.scale === item.value}
                        onClick={() => updateOptions({ scale: item.value as SealScale })}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            <button
              type="button"
              className="builder-mode-toggle"
              onClick={() => setMode((current) => (current === 'quick' ? 'custom' : 'quick'))}
            >
              {mode === 'quick' ? 'Personalizar cores e tamanho →' : '← Voltar ao simples'}
            </button>
          </div>
        </div>

        <div className="builder-code">
          <div className="builder-code-top">
            <div className="snippet-tabs" role="tablist" aria-label="Formatos de código">
              {(mode === 'quick' ? quickFormats : snippetTabs).map((tab) => (
                <button
                  type="button"
                  role="tab"
                  key={tab.value}
                  aria-selected={snippetKind === tab.value}
                  onClick={() => (mode === 'quick' ? setQuickFormat(tab.value as 'markdown' | 'html') : setActiveSnippet(tab.value))}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <pre>
            <code>{snippet}</code>
          </pre>
          <div className="builder-code-bottom">
            <p aria-live="polite">{copyState === 'success' ? 'Código copiado.' : copyState === 'error' ? 'Copie manualmente.' : ' '}</p>
            <button className="copy-code-button" type="button" onClick={copySnippet}>
              {copyState === 'success' ? 'Copiado' : copyState === 'error' ? 'Selecionar' : 'Copiar código'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
