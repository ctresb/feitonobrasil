export type SealLanguage = 'pt-br' | 'en';
export type SealVariant =
  | 'colorido'
  | 'branco-colorido'
  | 'preto'
  | 'branco'
  | 'verde'
  | 'azul'
  | 'amarelo'
  | 'custom';
export type SealScale = 0.5 | 1 | 2 | 3;
export type ColorMode = 'variant' | 'single' | 'split';

export type SealOptions = {
  language: SealLanguage;
  variant: SealVariant;
  scale: SealScale;
  colorMode: ColorMode;
  singleColor: string;
  feitoColor: string;
  brasilColor: string;
};

export type SnippetKind = 'markdown' | 'html' | 'readme' | 'react' | 'typescript' | 'javascript' | 'iframe';

export const SEAL_BASE_URL = 'https://selo.feitonobrasil.dev.br';
export const SITE_URL = 'https://feitonobrasil.dev.br';

export const LANGUAGE_OPTIONS: Array<{ value: SealLanguage; label: string; shortLabel: string }> = [
  { value: 'pt-br', label: 'Português', shortLabel: 'PT-BR' },
  { value: 'en', label: 'English', shortLabel: 'EN' },
];

export const SCALE_OPTIONS: Array<{ value: SealScale; label: string }> = [
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 3, label: '3x' },
];

export const VARIANT_OPTIONS: Array<{ value: Exclude<SealVariant, 'custom'>; label: string; tone: string }> = [
  { value: 'colorido', label: 'Colorido', tone: '#009440' },
  { value: 'branco-colorido', label: 'Branco colorido', tone: '#ffffff' },
  { value: 'preto', label: 'Preto', tone: '#232324' },
  { value: 'branco', label: 'Branco', tone: '#ffffff' },
  { value: 'verde', label: 'Verde', tone: '#009440' },
  { value: 'azul', label: 'Azul', tone: '#302681' },
  { value: 'amarelo', label: 'Amarelo', tone: '#ffcb00' },
];

export const SOLID_VARIANT_COLORS: Partial<Record<SealVariant, string>> = {
  preto: '#232324',
  branco: '#ffffff',
  verde: '#009440',
  azul: '#302681',
  amarelo: '#ffcb00',
};

export function getSealAlt(language: SealLanguage) {
  return language === 'en' ? 'Made in Brazil' : 'Feito no Brasil';
}

export function getSealAssetPath(language: SealLanguage) {
  return language === 'en'
    ? '/selos/madeinbrasil_preto_colorido.svg'
    : '/selos/feitonobrasil_preto_colorido.svg';
}

export function getSealDimensions(scale: SealScale) {
  return {
    width: Math.round(250 * scale),
    height: Math.round(120 * scale),
  };
}

export function normalizeHexColor(value: string, fallback: string) {
  const trimmed = value.trim();
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    return `#${normalized
      .slice(1)
      .split('')
      .map((part) => `${part}${part}`)
      .join('')}`.toLowerCase();
  }

  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return normalized.toLowerCase();
  }

  return fallback;
}

export function resolveSealColors(options: Pick<SealOptions, 'variant' | 'colorMode' | 'singleColor' | 'feitoColor' | 'brasilColor'>) {
  if (options.colorMode === 'single') {
    const color = normalizeHexColor(options.singleColor, '#232324');
    return { feitoColor: color, brasilColor: color, keepBrasilColorido: false };
  }

  if (options.colorMode === 'split') {
    return {
      feitoColor: normalizeHexColor(options.feitoColor, '#232324'),
      brasilColor: normalizeHexColor(options.brasilColor, '#009440'),
      keepBrasilColorido: false,
    };
  }

  if (options.variant === 'branco-colorido') {
    return { feitoColor: '#ffffff', brasilColor: null, keepBrasilColorido: true };
  }

  if (options.variant === 'colorido') {
    return { feitoColor: '#232324', brasilColor: null, keepBrasilColorido: true };
  }

  const solidColor = SOLID_VARIANT_COLORS[options.variant] ?? '#232324';
  return { feitoColor: solidColor, brasilColor: solidColor, keepBrasilColorido: false };
}

export function buildSealUrl(options: SealOptions, baseUrl = SEAL_BASE_URL) {
  const variant = options.colorMode === 'variant' ? options.variant : 'custom';
  const scaleLabel = `${options.scale}x`;
  const url = new URL(`/${options.language}/${variant}/${scaleLabel}.svg`, baseUrl);

  if (options.colorMode === 'single') {
    url.searchParams.set('color', normalizeHexColor(options.singleColor, '#232324'));
  }

  if (options.colorMode === 'split') {
    url.searchParams.set('feito', normalizeHexColor(options.feitoColor, '#232324'));
    url.searchParams.set('brasil', normalizeHexColor(options.brasilColor, '#009440'));
  }

  return url.toString();
}

export function getSnippet(kind: SnippetKind, options: SealOptions) {
  const src = buildSealUrl(options);
  const alt = getSealAlt(options.language);
  const { width, height } = getSealDimensions(options.scale);

  if (kind === 'markdown') {
    return `[![${alt}](${src})](${SITE_URL})`;
  }

  if (kind === 'html') {
    return `<a href="${SITE_URL}" aria-label="${alt}">
  <img src="${src}" alt="${alt}" width="${width}" height="${height}" loading="lazy" />
</a>`;
  }

  if (kind === 'readme') {
    return `<p align="center">
  <a href="${SITE_URL}">
    <img src="${src}" alt="${alt}" width="${width}" height="${height}" />
  </a>
</p>`;
  }

  if (kind === 'react') {
    return `export function FeitoNoBrasilSeal() {
  return (
    <a href="${SITE_URL}" aria-label="${alt}" target="_blank" rel="noreferrer">
      <img src="${src}" alt="${alt}" width={${width}} height={${height}} loading="lazy" />
    </a>
  );
}`;
  }

  if (kind === 'typescript') {
    return `export const feitoNoBrasilSeal = {
  href: '${SITE_URL}',
  src: '${src}',
  alt: '${alt}',
  width: ${width},
  height: ${height},
} as const;`;
  }

  if (kind === 'javascript') {
    return `const seal = document.createElement('a');
seal.href = '${SITE_URL}';
seal.ariaLabel = '${alt}';

const img = document.createElement('img');
img.src = '${src}';
img.alt = '${alt}';
img.width = ${width};
img.height = ${height};
img.loading = 'lazy';

seal.append(img);
document.querySelector('footer')?.append(seal);`;
  }

  return `<iframe
  title="${alt}"
  src="${src}"
  width="${width}"
  height="${height}"
  style="border:0;display:block"
></iframe>`;
}
