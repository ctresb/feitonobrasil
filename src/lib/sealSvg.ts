import type { SealOptions, SealScale } from './seal';
import { getSealDimensions, resolveSealColors } from './seal';

const PATH_PATTERN = /<path\b[^>]*\/>/g;
const FILL_PATTERN = /fill="[^"]*"/i;
const COLORIDO_START_PATTERN = /fill="#009440"/i;
const PATH_START_X_PATTERN = /d="M([0-9.-]+)/i;
const BRASIL_LETTER_SEQUENCE = ['b', 'r', 'a', 's', 'i', 'l'] as const;
const BRASIL_COLORIDO_PATH_SEQUENCE = ['b', 'r', 'a', 's', 'i', 'i', 'l'] as const;
const FEITO_CLASS = 'fnb-t';
const AUTO_DARK_FEITO = '#ffffff';

function replaceFill(path: string, color: string) {
  return path.replace(FILL_PATTERN, `fill="${color}"`);
}

function tagFeito(path: string, color: string) {
  return replaceFill(path, color).replace(/<path\b/, `<path class="${FEITO_CLASS}"`);
}

function injectAutoStyle(svg: string) {
  const style = `<style>@media(prefers-color-scheme:dark){.${FEITO_CLASS}{fill:${AUTO_DARK_FEITO}}}</style>`;
  return svg.replace(/>/, `>${style}`);
}

function splitSealPaths(paths: string[]) {
  const brasilStart = paths.findIndex((path) => COLORIDO_START_PATTERN.test(path));
  return brasilStart > 0 ? brasilStart : Math.ceil(paths.length / 2);
}

function getPathStartX(path: string) {
  return Number(PATH_START_X_PATTERN.exec(path)?.[1] ?? 0);
}

function getBrasilLetterColors(paths: string[], colors: NonNullable<ReturnType<typeof resolveSealColors>['brasilLetterColors']>) {
  const letterSequence = paths.length === BRASIL_COLORIDO_PATH_SEQUENCE.length ? BRASIL_COLORIDO_PATH_SEQUENCE : BRASIL_LETTER_SEQUENCE;

  return paths
    .map((path, index) => ({ index, x: getPathStartX(path) }))
    .sort((a, b) => a.x - b.x)
    .reduce<Record<number, string>>((map, path, index) => {
      map[path.index] = colors[letterSequence[index] ?? 'l'] ?? colors.l;
      return map;
    }, {});
}

function setIntrinsicSize(svg: string, scale: SealScale) {
  const { width, height } = getSealDimensions(scale);

  return svg
    .replace(/\swidth="250"/, ` width="${width}"`)
    .replace(/\sheight="120"/, ` height="${height}"`);
}

export function recolorSealSvg(baseSvg: string, options: SealOptions) {
  const paths = baseSvg.match(PATH_PATTERN);

  if (!paths?.length) {
    return setIntrinsicSize(baseSvg, options.scale);
  }

  const splitIndex = splitSealPaths(paths);
  const autoTheme = Boolean(options.autoTheme);
  const { feitoColor, brasilColor, brasilLetterColors, keepBrasilColorido } = autoTheme
    ? { feitoColor: '#232324', brasilColor: null, brasilLetterColors: null, keepBrasilColorido: true }
    : resolveSealColors(options);
  const brasilPathColors = brasilLetterColors ? getBrasilLetterColors(paths.slice(splitIndex), brasilLetterColors) : null;
  let cursor = 0;

  const rendered = baseSvg.replace(PATH_PATTERN, (path) => {
    const isFeitoPath = cursor < splitIndex;
    const brasilIndex = cursor - splitIndex;
    cursor += 1;

    if (isFeitoPath) {
      return autoTheme ? tagFeito(path, feitoColor) : replaceFill(path, feitoColor);
    }

    if (brasilPathColors) {
      return replaceFill(path, brasilPathColors[brasilIndex]);
    }

    if (keepBrasilColorido || !brasilColor) {
      return path;
    }

    return replaceFill(path, brasilColor);
  });

  const themed = autoTheme ? injectAutoStyle(rendered) : rendered;
  return setIntrinsicSize(themed, options.scale);
}
