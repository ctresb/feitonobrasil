# Feito no Brasil

<p align="center">
  <a href="https://feitonobrasil.dev.br">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://selo.feitonobrasil.dev.br/pt-br/branco-colorido/1x.svg" width="250" height="120">
      <source media="(prefers-color-scheme: light)" srcset="https://selo.feitonobrasil.dev.br/pt-br/colorido/1x.svg" width="250" height="120">
      <img alt="Feito no Brasil" src="https://selo.feitonobrasil.dev.br/pt-br/colorido/1x.svg" width="250" height="120">
    </picture>
  </a>
</p>


Selo aberto para devs brasileiros marcarem READMEs, sites, bibliotecas e produtos digitais feitos daqui.

`Feito no Brasil` não é prêmio, ranking ou certificado. É uma assinatura simples: se o projeto nasceu aqui, foi feito por gente daqui ou tem manutenção brasileira de verdade, pode usar.

## Use o selo

Markdown:

```md
[![Feito no Brasil](https://selo.feitonobrasil.dev.br/pt-br/colorido/1x.svg)](https://feitonobrasil.dev.br)
```

HTML:

```html
<a href="https://feitonobrasil.dev.br" aria-label="Feito no Brasil">
  <img
    src="https://selo.feitonobrasil.dev.br/pt-br/colorido/1x.svg"
    alt="Feito no Brasil"
    width="250"
    height="120"
    loading="lazy"
  />
</a>
```

README centralizado:

```html
<p align="center">
  <a href="https://feitonobrasil.dev.br">
    <img src="https://selo.feitonobrasil.dev.br/pt-br/colorido/1x.svg" alt="Feito no Brasil" width="250" height="120" />
  </a>
</p>
```

Quer trocar idioma, cor ou tamanho? Use o gerador em [feitonobrasil.dev.br](https://feitonobrasil.dev.br).

## URLs oficiais

Base do selo:

```txt
https://selo.feitonobrasil.dev.br
```

Formato principal:

```txt
/:idioma/:variante/:tamanho.svg
```

Exemplos:

```txt
https://selo.feitonobrasil.dev.br/pt-br/colorido/1x.svg
https://selo.feitonobrasil.dev.br/pt-br/branco/1x.svg
https://selo.feitonobrasil.dev.br/en/colorido/1x.svg
```

Cores customizadas:

```txt
https://selo.feitonobrasil.dev.br/pt-br/custom/1x.svg?feito=%23232324&brasil=%23009440
https://selo.feitonobrasil.dev.br/pt-br/custom/1x.svg?color=%23232324
```

Opções aceitas pelo Worker:

| Campo | Valores |
|---|---|
| `idioma` | `pt-br`, `en` |
| `variante` | `colorido`, `branco-colorido`, `preto`, `branco`, `verde`, `azul`, `amarelo`, `custom` |
| `tamanho` | `0.5x`, `1x`, `2x`, `3x` |
| `color` / `cor` | uma cor hexadecimal para o selo todo |
| `feito` + `brasil` | duas cores hexadecimais, uma para cada parte |

## O que tem neste repo

- Landing page em React/Vite para apresentar o selo e copiar snippets.
- Gerador visual com variações de idioma, cor e tamanho.
- SVGs prontos em português e inglês.
- Cloudflare Worker que serve o selo oficial e recolore SVGs via query string.

## Rodar local

Use `pnpm`.

```bash
pnpm install
pnpm dev
```

Abra a URL impressa pelo Vite, normalmente `http://127.0.0.1:5173`.

Para simular o Worker com os assets:

```bash
pnpm build
pnpm worker:dev
```

## Comandos

| Comando | Uso |
|---|---|
| `pnpm dev` | Roda a landing page local com Vite. |
| `pnpm typecheck` | Valida TypeScript sem emitir arquivos. |
| `pnpm build` | Roda typecheck e gera `dist/`. |
| `pnpm preview` | Serve o build local. |
| `pnpm worker:dev` | Roda o Cloudflare Worker local. |
| `pnpm worker:deploy` | Faz build e deploy do domínio oficial `selo.feitonobrasil.dev.br`. |
| `pnpm worker:deploy:workers-dev` | Faz deploy usando a config de workers.dev. |

## Mapa do projeto

| Caminho | Responsabilidade |
|---|---|
| `src/components/` | Blocos da landing page: hero, vitrine, gerador, origem visual e rodapé. |
| `src/lib/seal.ts` | Opções do selo, URLs oficiais, dimensões e snippets. |
| `src/lib/sealSvg.ts` | Recoloração do SVG base. |
| `src/data/roadmap.ts` | Itens públicos do roadmap. |
| `public/selos/` | SVGs base usados pela página e pelo Worker. |
| `worker/src/index.ts` | Roteamento, parsing de URL/query e resposta SVG com cache. |
| `wrangler.toml` | Deploy do Worker no domínio oficial. |

## Critério de uso

Use o selo com bom senso.

Cabe bem quando:

- o projeto foi criado no Brasil;
- a manutenção principal é feita por devs brasileiros;
- a lib, app ou produto tem autoria brasileira clara.

Evite usar quando o vínculo com o Brasil for só marketing. O selo funciona melhor quando ele aponta para trabalho real.

## Deploy

O site público usa os assets gerados em `dist/`. O Worker oficial roda com `run_worker_first = true`, então URLs de selo conhecidas são tratadas pelo Worker e o resto cai para os assets estáticos.

Antes de deploy:

```bash
pnpm build
```

Deploy oficial:

```bash
pnpm worker:deploy
```

## Roadmap

Agora: selo pronto para copiar, URLs parametrizadas e snippets para usos comuns.

Próximo: vitrine simples de projetos brasileiros usando o selo.

Quando fizer sentido: adoção pública, envio voluntário de projetos e um espaço leve para manter o selo vivo.

## Licença

MIT. Veja [`LICENSE`](LICENSE).
