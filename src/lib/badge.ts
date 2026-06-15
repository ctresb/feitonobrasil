import { SealOptions, normalizeHexColor } from './seal';

const VERDANA_11X_WIDTHS: Record<string, number> = {
  ' ': 4.1,   '!': 3.1,   '"': 5.2,   '#': 7.3,
  '$': 7.3,   '%': 11.2,  '&': 8.8,   '\'': 3.1,
  '(': 4.6,   ')': 4.6,   '*': 5.5,   '+': 7.3,
  ',': 3.1,   '-': 4.6,   '.': 3.1,   '/': 4.6,
  '0': 7.3,   '1': 7.3,   '2': 7.3,   '3': 7.3,
  '4': 7.3,   '5': 7.3,   '6': 7.3,   '7': 7.3,
  '8': 7.3,   '9': 7.3,   ':': 3.1,   ';': 3.1,
  '<': 7.3,   '=': 7.3,   '>': 7.3,   '?': 5.9,
  '@': 12.1,  
  'A': 8.1,   'B': 8.1,   'C': 9.0,   'D': 9.0,
  'E': 7.9,   'F': 7.3,   'G': 9.0,   'H': 9.0,
  'I': 3.9,   'J': 5.6,   'K': 8.1,   'L': 6.9,
  'M': 11.1,  'N': 9.0,   'O': 9.4,   'P': 8.1,
  'Q': 9.4,   'R': 8.1,   'S': 8.1,   'T': 7.9,
  'U': 9.0,   'V': 8.1,   'W': 11.4,  'X': 8.1,
  'Y': 8.1,   'Z': 8.1,   '[': 4.6,   '\\': 4.6,
  ']': 4.6,   '^': 6.9,   '_': 7.3,   '`': 4.6,
  'a': 6.9,   'b': 6.9,   'c': 5.9,   'd': 6.9,
  'e': 6.9,   'f': 4.0,   'g': 6.9,   'h': 6.9,
  'i': 2.9,   'j': 2.9,   'k': 6.9,   'l': 2.9,
  'm': 11.3,  'n': 6.9,   'o': 6.9,   'p': 6.9,
  'q': 6.9,   'r': 4.6,   's': 5.5,   't': 4.1,
  'u': 6.9,   'v': 6.9,   'w': 9.9,   'x': 6.9,
  'y': 6.9,   'z': 5.9,   '{': 4.6,   '|': 3.1,
  '}': 4.6,   '~': 7.3
};

const ACCENT_MAP: Record<string, string> = {
  'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
  'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
  'ç': 'c',
  'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A',
  'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
  'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
  'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
  'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
  'Ç': 'C'
};

export function getTextWidth(text: string): number {
  let total = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const resolvedChar = ACCENT_MAP[char] || char;
    const width = VERDANA_11X_WIDTHS[resolvedChar] !== undefined ? VERDANA_11X_WIDTHS[resolvedChar] : 7.0;
    total += width;
  }
  return total;
}

function getContrastColor(hexColor: string): '#232324' | '#ffffff' {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return '#ffffff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#232324' : '#ffffff';
}

export function generateBadgeSvg(options: SealOptions, showLogo: boolean = true): string {
  const leftText = options.language === 'en' ? 'made in' : 'feito no';
  const rightText = options.language === 'en' ? 'Brazil' : 'Brasil';

  let leftBg = '#555555';
  let rightBg = '#009440';

  if (options.colorMode === 'split') {
    leftBg = normalizeHexColor(options.feitoColor, '#232324');
    rightBg = normalizeHexColor(options.brasilColor, '#009440');
  } else if (options.colorMode === 'single') {
    leftBg = '#555555';
    rightBg = normalizeHexColor(options.singleColor, '#232324');
  } else if (options.colorMode === 'variant') {
    if (options.variant === 'colorido') {
      leftBg = '#555555';
      rightBg = '#009440';
    } else if (options.variant === 'branco-colorido') {
      leftBg = '#ffffff';
      rightBg = '#009440';
    } else if (options.variant === 'preto') {
      leftBg = '#555555';
      rightBg = '#232324';
    } else if (options.variant === 'branco') {
      leftBg = '#ffffff';
      rightBg = '#ffffff';
    } else if (options.variant === 'verde') {
      leftBg = '#555555';
      rightBg = '#009440';
    } else if (options.variant === 'azul') {
      leftBg = '#555555';
      rightBg = '#302681';
    } else if (options.variant === 'amarelo') {
      leftBg = '#555555';
      rightBg = '#ffcb00';
    }
  }

  // Determine text colors
  let leftTextColor = '#ffffff';
  if (getContrastColor(leftBg) === '#232324') {
    leftTextColor = '#232324';
  }

  let rightTextColor = '#ffffff';
  if (options.colorMode === 'variant' && (options.variant === 'colorido' || options.variant === 'branco-colorido')) {
    rightTextColor = '#ffcb00';
  } else {
    if (getContrastColor(rightBg) === '#232324') {
      rightTextColor = '#232324';
    }
  }

  const leftTextWidth = Math.round(getTextWidth(leftText) * 10) / 10;
  const rightTextWidth = Math.round(getTextWidth(rightText) * 10) / 10;

  // Paddings
  let leftWidth: number;
  let leftTextX: number;
  if (showLogo) {
    leftWidth = 5 + 14 + 3 + leftTextWidth + 10;
    leftTextX = 5 + 14 + 3 + (leftTextWidth / 2);
  } else {
    leftWidth = 10 + leftTextWidth + 10;
    leftTextX = 10 + (leftTextWidth / 2);
  }

  const rightWidth = 10 + rightTextWidth + 10;
  const rightTextX = leftWidth + (rightWidth / 2);
  const totalWidth = leftWidth + rightWidth;

  const scale = options.scale || 1;
  const scaledWidth = Math.round(totalWidth * scale);
  const scaledHeight = Math.round(20 * scale);

  const shadowOpacityLeft = leftTextColor === '#232324' ? '.1' : '.3';
  const shadowOpacityRight = rightTextColor === '#232324' ? '.1' : '.3';

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${totalWidth} 20" role="img" aria-label="${leftText}: ${rightText}">
  <title>${leftText}: ${rightText}</title>
  <defs>
    <linearGradient id="s" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <clipPath id="r">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </clipPath>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@400;900&amp;display=swap');
      .font-badge {
        font-family: 'Londrina Solid', system-ui, -apple-system, sans-serif;
      }
    </style>
  </defs>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="20" fill="${leftBg}"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="20" fill="${rightBg}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g class="font-badge" fill="#fff" text-anchor="middle" text-rendering="geometricPrecision" font-size="110">
    ${showLogo ? `
    <g transform="translate(5, 3)">
      <svg width="14" height="14" viewBox="0 0 20 14">
        <rect width="20" height="14" fill="#009c3b" />
        <polygon points="10,1.5 18.5,7 10,12.5 1.5,7" fill="#ffdf00" />
        <circle cx="10" cy="7" r="3.7" fill="#002171" />
        <path d="M 6.3 7.5 C 8 8.5, 11.5 7.5, 13.7 6.2 C 13.5 5.8, 13.1 5.4, 12.7 5.2 C 10.5 6.5, 8.5 7, 6.7 6.3 C 6.5 6.7, 6.4 7.1, 6.3 7.5 Z" fill="#ffffff" />
      </svg>
    </g>` : ''}
    <text font-weight="400" aria-hidden="true" x="${Math.round(leftTextX * 10)}" y="150" fill="#010101" fill-opacity="${shadowOpacityLeft}" transform="scale(.1)" textLength="${Math.round(leftTextWidth * 10)}">${leftText}</text>
    <text font-weight="400" x="${Math.round(leftTextX * 10)}" y="140" transform="scale(.1)" fill="${leftTextColor}" textLength="${Math.round(leftTextWidth * 10)}">${leftText}</text>
    <text font-weight="900" aria-hidden="true" x="${Math.round(rightTextX * 10)}" y="150" fill="#010101" fill-opacity="${shadowOpacityRight}" transform="scale(.1)" textLength="${Math.round(rightTextWidth * 10)}">${rightText}</text>
    <text font-weight="900" x="${Math.round(rightTextX * 10)}" y="140" transform="scale(.1)" fill="${rightTextColor}" textLength="${Math.round(rightTextWidth * 10)}">${rightText}</text>
  </g>
</svg>`;
}
