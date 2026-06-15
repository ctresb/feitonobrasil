import type { ColorMode, SealLanguage, SealOptions, SealScale, SealVariant } from '../../src/lib/seal';
import { getSealAssetPath, normalizeHexColor } from '../../src/lib/seal';
import { recolorSealSvg } from '../../src/lib/sealSvg';

type AssetsBinding = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

type Env = {
  ASSETS: AssetsBinding;
};

const VARIANTS: SealVariant[] = ['colorido', 'branco-colorido', 'preto', 'branco', 'verde', 'azul', 'amarelo', 'custom'];
const SCALES: SealScale[] = [0.5, 1, 2, 3];

const DEFAULT_OPTIONS: SealOptions = {
  language: 'pt-br',
  variant: 'colorido',
  scale: 1,
  colorMode: 'variant',
  singleColor: '#232324',
  feitoColor: '#232324',
  brasilColor: '#009440',
};

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

  if (segments.length > 3) {
    return false;
  }

  if (segments.some((segment) => segment.startsWith('.') || (segment.includes('.') && !segment.toLowerCase().endsWith('.svg')))) {
    return false;
  }

  const [first, second, third] = segments;
  const pathLanguage = parseLanguage(first);

  if (pathLanguage) {
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
  const [first, second, third] = segments;

  const pathLanguage = parseLanguage(first);
  if (pathLanguage) {
    options.language = pathLanguage;
  }

  const variantCandidate = pathLanguage ? second : first;
  const scaleCandidate = pathLanguage ? third : second;
  const pathVariant = parseVariant(variantCandidate);
  const pathScale = parseScale(scaleCandidate) ?? parseScale(variantCandidate);

  if (pathVariant) {
    options.variant = pathVariant;
  }

  if (pathScale) {
    options.scale = pathScale;
  }

  options.language = parseLanguage(getFirstParam(url, ['lang', 'language', 'idioma'])) ?? options.language;
  options.variant = parseVariant(url.searchParams.get('variant')) ?? options.variant;
  options.scale = parseScale(getFirstParam(url, ['scale', 'size', 'tamanho'])) ?? options.scale;

  const singleColor = getFirstParam(url, ['color', 'cor']);
  const feitoColor = getFirstParam(url, ['feito', 'made', 'top']);
  const brasilColor = getFirstParam(url, ['brasil', 'brazil', 'bottom']);

  let colorMode: ColorMode = options.variant === 'custom' ? 'split' : 'variant';

  if (singleColor) {
    colorMode = 'single';
    options.singleColor = normalizeHexColor(singleColor, DEFAULT_OPTIONS.singleColor);
  } else if (feitoColor || brasilColor) {
    colorMode = 'split';
    options.feitoColor = normalizeHexColor(feitoColor ?? DEFAULT_OPTIONS.feitoColor, DEFAULT_OPTIONS.feitoColor);
    options.brasilColor = normalizeHexColor(brasilColor ?? DEFAULT_OPTIONS.brasilColor, DEFAULT_OPTIONS.brasilColor);
  }

  options.colorMode = colorMode;
  return options;
}

async function loadBaseSvg(request: Request, env: Env, language: SealLanguage) {
  const assetUrl = new URL(getSealAssetPath(language), request.url);
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

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const segments = getPathSegments(url);

      if (segments.some((segment) => segment.startsWith('.'))) {
        return new Response('Seal not found', {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      }

      if (!isKnownSealPath(request)) {
        return env.ASSETS.fetch(request);
      }

      const options = parseRequestOptions(request);
      const baseSvg = await loadBaseSvg(request, env, options.language);
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
