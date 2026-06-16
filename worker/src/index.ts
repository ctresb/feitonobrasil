import type { ColorMode, SealLanguage, SealOptions, SealScale, SealStyle, SealVariant } from '../../src/lib/seal';
import { DEFAULT_BRASIL_LETTER_COLORS, getSealAssetPath, normalizeHexColor } from '../../src/lib/seal';
import { recolorSealSvg } from '../../src/lib/sealSvg';
import { generateBadgeSvg } from '../../src/lib/badge';

type AssetsBinding = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

type Env = {
  ASSETS: AssetsBinding;
};

const VARIANTS: SealVariant[] = ['colorido', 'branco-colorido', 'preto', 'branco', 'verde', 'azul', 'amarelo', 'custom'];
const STYLES: SealStyle[] = ['divertido', 'serio'];
const SCALES: SealScale[] = [0.5, 1, 2, 3];

const DEFAULT_OPTIONS: SealOptions = {
  language: 'pt-br',
  style: 'divertido',
  variant: 'colorido',
  scale: 1,
  colorMode: 'variant',
  singleColor: '#232324',
  feitoColor: '#232324',
  brasilColor: '#009440',
  ...DEFAULT_BRASIL_LETTER_COLORS,
};

const ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: https://feitonobrasil.dev.br/sitemap.xml
`;

function parseLanguage(value: string | null): SealLanguage | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();

  if (normalized === 'en' || normalized === 'english') {
    return 'en';
  }

  if (normalized === 'pt' || normalized === 'pt-br' || normalized === 'br' || normalized === 'portugues') {
    return 'pt-br';
  }

  return null;
}

function parseStyle(value: string | null): SealStyle | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/_/g, '-').replace(/\.svg$/, '');

  if (normalized === 'serio' || normalized === 'serious' || normalized === 'corp' || normalized === 'corporativo') {
    return 'serio';
  }

  if (normalized === 'divertido' || normalized === 'fun' || normalized === 'original') {
    return 'divertido';
  }

  return STYLES.includes(normalized as SealStyle) ? (normalized as SealStyle) : null;
}

function parseVariant(value: string | null): SealVariant | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().replace(/_/g, '-').replace(/\.svg$/, '');
  return VARIANTS.includes(normalized as SealVariant) ? (normalized as SealVariant) : null;
}

function parseScale(value: string | null): SealScale | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().replace(/\.svg$/, '').replace('x', '');
  const parsed = Number(normalized);
  return SCALES.includes(parsed as SealScale) ? (parsed as SealScale) : null;
}

function getFirstParam(url: URL, names: string[]) {
  for (const name of names) {
    const value = url.searchParams.get(name);
    if (value) {
      return value;
    }
  }

  return null;
}

function getPathSegments(url: URL) {
  return url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
}

function isKnownSealPath(request: Request) {
  const url = new URL(request.url);
  const segments = getPathSegments(url);

  if (segments.length === 0) {
    return false;
  }

  if (segments.length > 4) {
    return false;
  }

  if (segments.some((segment) => segment.startsWith('.') || (segment.includes('.') && !segment.toLowerCase().endsWith('.svg')))) {
    return false;
  }

  const [first, second, third, fourth] = segments;
  const pathLanguage = parseLanguage(first);

  if (pathLanguage) {
    const pathStyle = parseStyle(second);
    const variantCandidate = pathStyle ? third : second;
    const scaleCandidate = pathStyle ? fourth : third;

    if (scaleCandidate && !parseScale(scaleCandidate)) {
      return false;
    }

    return Boolean(!variantCandidate || parseVariant(variantCandidate) || parseScale(variantCandidate));
  }

  const pathStyle = parseStyle(first);
  if (pathStyle) {
    if (fourth) {
      return false;
    }

    if (third && !parseScale(third)) {
      return false;
    }

    return Boolean(!second || parseVariant(second) || parseScale(second));
  }

  if (third) {
    return false;
  }

  if (second && !parseScale(second)) {
    return false;
  }

  return Boolean(parseVariant(first) || parseScale(first));
}

function parseRequestOptions(request: Request): SealOptions {
  const url = new URL(request.url);
  const segments = getPathSegments(url);
  const options: SealOptions = { ...DEFAULT_OPTIONS };
  const [first, second, third, fourth] = segments;

  const pathLanguage = parseLanguage(first);
  const pathStyle = pathLanguage ? parseStyle(second) : parseStyle(first);

  if (pathLanguage) {
    options.language = pathLanguage;
  }

  if (pathStyle) {
    options.style = pathStyle;
  }

  const variantCandidate = pathLanguage ? (pathStyle ? third : second) : (pathStyle ? second : first);
  const scaleCandidate = pathLanguage ? (pathStyle ? fourth : third) : (pathStyle ? third : second);
  const pathVariant = parseVariant(variantCandidate);
  const pathScale = parseScale(scaleCandidate) ?? parseScale(variantCandidate);

  if (pathVariant) {
    options.variant = pathVariant;
  }

  if (pathScale) {
    options.scale = pathScale;
  }

  options.language = parseLanguage(getFirstParam(url, ['lang', 'language', 'idioma'])) ?? options.language;
  options.style = parseStyle(getFirstParam(url, ['style', 'estilo'])) ?? options.style;
  options.variant = parseVariant(url.searchParams.get('variant')) ?? options.variant;
  options.scale = parseScale(getFirstParam(url, ['scale', 'size', 'tamanho'])) ?? options.scale;

  const singleColor = getFirstParam(url, ['color', 'cor']);
  const feitoColor = getFirstParam(url, ['feito', 'made', 'top']);
  const brasilColor = getFirstParam(url, ['brasil', 'brazil', 'bottom']);
  const brasilBColor = url.searchParams.get('b');
  const brasilRColor = url.searchParams.get('r');
  const brasilAColor = url.searchParams.get('a');
  const brasilSColor = url.searchParams.get('s');
  const brasilIColor = url.searchParams.get('i');
  const brasilLColor = url.searchParams.get('l');
  const hasBrasilLetterColors = Boolean(brasilBColor || brasilRColor || brasilAColor || brasilSColor || brasilIColor || brasilLColor);

  let colorMode: ColorMode = options.variant === 'custom' ? 'split' : 'variant';

  if (hasBrasilLetterColors) {
    colorMode = 'colorido';
    options.feitoColor = normalizeHexColor(feitoColor ?? DEFAULT_OPTIONS.feitoColor, DEFAULT_OPTIONS.feitoColor);
    options.brasilBColor = normalizeHexColor(brasilBColor ?? DEFAULT_OPTIONS.brasilBColor, DEFAULT_OPTIONS.brasilBColor);
    options.brasilRColor = normalizeHexColor(brasilRColor ?? DEFAULT_OPTIONS.brasilRColor, DEFAULT_OPTIONS.brasilRColor);
    options.brasilAColor = normalizeHexColor(brasilAColor ?? DEFAULT_OPTIONS.brasilAColor, DEFAULT_OPTIONS.brasilAColor);
    options.brasilSColor = normalizeHexColor(brasilSColor ?? DEFAULT_OPTIONS.brasilSColor, DEFAULT_OPTIONS.brasilSColor);
    options.brasilIColor = normalizeHexColor(brasilIColor ?? DEFAULT_OPTIONS.brasilIColor, DEFAULT_OPTIONS.brasilIColor);
    options.brasilLColor = normalizeHexColor(brasilLColor ?? DEFAULT_OPTIONS.brasilLColor, DEFAULT_OPTIONS.brasilLColor);
  } else if (singleColor) {
    colorMode = 'single';
    options.singleColor = normalizeHexColor(singleColor, DEFAULT_OPTIONS.singleColor);
  } else if (feitoColor || brasilColor) {
    colorMode = 'split';
    options.feitoColor = normalizeHexColor(feitoColor ?? DEFAULT_OPTIONS.feitoColor, DEFAULT_OPTIONS.feitoColor);
    options.brasilColor = normalizeHexColor(brasilColor ?? DEFAULT_OPTIONS.brasilColor, DEFAULT_OPTIONS.brasilColor);
  }

  options.colorMode = colorMode;

  const theme = getFirstParam(url, ['theme', 'tema']);
  if (theme && theme.toLowerCase() === 'auto') {
    options.autoTheme = true;
  }

  return options;
}

function parseLegacyAssetOptions(url: URL): SealOptions | null {
  const segments = getPathSegments(url);

  if (segments.length !== 2 || segments[0] !== 'selos') {
    return null;
  }

  const normalized = segments[1].toLowerCase().replace(/\.svg$/, '');
  const match = /^(feitonobrasil|madeinbrasil)_(.+)$/.exec(normalized);

  if (!match) {
    return null;
  }

  const variantName = match[2] === 'preto_colorido' ? 'colorido' : match[2];
  const variant = parseVariant(variantName);

  if (!variant) {
    return null;
  }

  return {
    ...DEFAULT_OPTIONS,
    language: match[1] === 'madeinbrasil' ? 'en' : 'pt-br',
    variant,
  };
}

async function loadBaseSvg(request: Request, env: Env, language: SealLanguage, style: SealStyle) {
  const assetUrl = new URL(getSealAssetPath(language, style), request.url);
  const response = await env.ASSETS.fetch(assetUrl);

  if (!response.ok) {
    throw new Error(`Base SVG not found: ${assetUrl.pathname}`);
  }

  return response.text();
}

function svgResponse(svg: string) {
  return new Response(svg, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === 'www.feitonobrasil.dev.br') {
      url.hostname = 'feitonobrasil.dev.br';
      return Response.redirect(url.toString(), 301);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        },
      });
    }

    const pathname = url.pathname.toLowerCase();
    const isBadge = pathname === '/badge.svg' || pathname === '/pt-br/badge.svg' || pathname === '/en/badge.svg';

    if (isBadge) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', { status: 405 });
      }
      try {
        const options = parseRequestOptions(request);
        options.componentType = 'badge';
        const showLogo = url.searchParams.get('logo') !== 'false' && url.searchParams.get('logo') !== '0';
        const svg = generateBadgeSvg(options, showLogo);
        return request.method === 'HEAD' ? svgResponse('') : svgResponse(svg);
      } catch (error) {
        return new Response(error instanceof Error ? error.message : 'Unexpected badge error', {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      }
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const segments = getPathSegments(url);

      if (url.pathname === '/robots.txt') {
        return new Response(request.method === 'HEAD' ? null : ROBOTS_TXT, {
          headers: {
            'Cache-Control': 'public, max-age=0, must-revalidate',
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      }

      if (segments.some((segment) => segment.startsWith('.'))) {
        return new Response('Seal not found', {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      }

      const legacyOptions = parseLegacyAssetOptions(url);

      if (!legacyOptions && !isKnownSealPath(request)) {
        return env.ASSETS.fetch(request);
      }

      const options = legacyOptions ?? parseRequestOptions(request);
      const baseSvg = await loadBaseSvg(request, env, options.language, options.style);
      const svg = recolorSealSvg(baseSvg, options);
      return request.method === 'HEAD' ? svgResponse('') : svgResponse(svg);
    } catch (error) {
      return new Response(error instanceof Error ? error.message : 'Unexpected seal error', {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }
  },
};
