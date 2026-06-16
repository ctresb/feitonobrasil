import type { SealOptions, SealScale } from './seal';
import { getSealDimensions, resolveSealColors } from './seal';

const PATH_PATTERN = /<path\b[^>]*\/>/g;
const FILL_PATTERN = /fill="[^"]*"/i;
const COLORIDO_START_PATTERN = /fill="#009440"/i;

/** Class tag + dark fill used by the auto-theme media query. */
const FEITO_CLASS = 'fnb-t';
const AUTO_DARK_FEITO = '#ffffff';

function replaceFill(path: string, color: string) {
  return path.replace(FILL_PATTERN, `fill="${color}"`);
}

function tagFeito(path: string, color: string) {
  return replaceFill(path, color).replace(/<path\b/, `<path class="${FEITO_CLASS}"`);
}

function injectAutoStyle(svg: string) {
  // CSS beats presentation attributes, so .fnb-t{fill} overrides the inline light fill in dark mode.
  const style = `<style>@media(prefers-color-scheme:dark){.${FEITO_CLASS}{fill:${AUTO_DARK_FEITO}}}</style>`;
  return svg.replace(/>/, `>${style}`);
}

function splitSealPaths(paths: string[]) {
  const brasilStart = paths.findIndex((path) => COLORIDO_START_PATTERN.test(path));
  return brasilStart > 0 ? brasilStart : Math.ceil(paths.length / 2);
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
  // Auto-theme forces colorido semantics: dark text on light, white text on dark, flag stays colored.
  const autoTheme = Boolean(options.autoTheme);
  const { feitoColor, brasilColor, keepBrasilColorido } = autoTheme
    ? { feitoColor: '#232324', brasilColor: null, keepBrasilColorido: true }
    : resolveSealColors(options);
  let cursor = 0;

  const rendered = baseSvg.replace(PATH_PATTERN, (path) => {
    const isFeitoPath = cursor < splitIndex;
    cursor += 1;

    if (isFeitoPath) {
      return autoTheme ? tagFeito(path, feitoColor) : replaceFill(path, feitoColor);
    }

    if (keepBrasilColorido || !brasilColor) {
      return path;
    }

    return replaceFill(path, brasilColor);
  });

  const themed = autoTheme ? injectAutoStyle(rendered) : rendered;
  return setIntrinsicSize(themed, options.scale);
}
