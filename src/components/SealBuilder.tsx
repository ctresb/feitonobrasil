import { useEffect, useMemo, useState } from 'react';
import {
  LANGUAGE_OPTIONS,
  SCALE_OPTIONS,
  VARIANT_OPTIONS,
  buildSealUrl,
  getSealAlt,
  getSealAssetPath,
  getSnippet,
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

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function SealBuilder() {
  const [options, setOptions] = useState<SealOptions>(DEFAULT_OPTIONS);
  const [activeSnippet, setActiveSnippet] = useState<SnippetKind>('html');
  const [baseSvg, setBaseSvg] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');
  const [darkVariant, setDarkVariant] = useState<SealVariant>('branco-colorido');
  const [pictureFallback, setPictureFallback] = useState<PictureFallback>('light');

  useEffect(() => {
    const controller = new AbortController();

    fetch(getSealAssetPath(options.language), { signal: controller.signal })
      .then((response) => response.text())
      .then(setBaseSvg)
      .catch(() => setBaseSvg(''));

    return () => controller.abort();
  }, [options.language]);

  const previewSrc = useMemo(() => {
    if (!baseSvg) {
      return buildSealUrl(options);
    }

    return svgDataUrl(recolorSealSvg(baseSvg, options));
  }, [baseSvg, options]);

  const pictureDarkOptions = useMemo<SealOptions>(
    () => ({
      ...options,
      variant: darkVariant,
      colorMode: 'variant',
    }),
    [options, darkVariant],
  );

  const snippet = useMemo(
    () => getSnippet(activeSnippet, options, pictureDarkOptions, pictureFallback),
    [activeSnippet, options, pictureDarkOptions, pictureFallback],
  );
  const sealUrl = useMemo(() => buildSealUrl(options), [options]);

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
        <p className="section-label">personalizar</p>
        <h2 id="builder-title">Monta o selo e copia o código.</h2>
      </div>

      <div className="builder-layout">
        <div className="builder-left">
          <div className="builder-preview" aria-label="Preview do selo">
            <img src={previewSrc} alt={getSealAlt(options.language)} />
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

            <div className="control-row">
              <span>Cor</span>
              <div className="segmented-control">
                {colorModes.map((mode) => (
                  <button
                    type="button"
                    key={mode.value}
                    aria-pressed={options.colorMode === mode.value}
                    onClick={() => updateOptions({ colorMode: mode.value, variant: mode.value === 'variant' ? 'colorido' : 'custom' })}
                  >
                    {mode.label}
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
          </div>
        </div>

        <div className="builder-code">
          <div className="builder-code-top">
            <div className="snippet-tabs" role="tablist" aria-label="Formatos de código">
              {snippetTabs.map((tab) => (
                <button
                  type="button"
                  role="tab"
                  key={tab.value}
                  aria-selected={activeSnippet === tab.value}
                  onClick={() => setActiveSnippet(tab.value)}
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
