import type { SealOptions, SealScale } from './seal';
import { getSealDimensions, resolveSealColors } from './seal';

const PATH_PATTERN = /<path\b[^>]*\/>/g;
const FILL_PATTERN = /fill="[^"]*"/i;
const COLORIDO_START_PATTERN = /fill="#009440"/i;

function replaceFill(path: string, color: string) {
  return path.replace(FILL_PATTERN, `fill="${color}"`);
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
  const { feitoColor, brasilColor, keepBrasilColorido } = resolveSealColors(options);
  let cursor = 0;

  const rendered = baseSvg.replace(PATH_PATTERN, (path) => {
    const isFeitoPath = cursor < splitIndex;
    cursor += 1;

    if (isFeitoPath) {
      return replaceFill(path, feitoColor);
    }

    if (keepBrasilColorido || !brasilColor) {
      return path;
    }

    return replaceFill(path, brasilColor);
  });

  return setIntrinsicSize(rendered, options.scale);
}
