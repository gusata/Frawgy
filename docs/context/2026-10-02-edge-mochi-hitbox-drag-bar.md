# Snapshot — 2026-10-02: hitbox do notch durante arrasto

## Objetivo

Reduzir a área que ativa o menu enquanto um arquivo está sendo arrastado.

## Alterações realizadas

- Removido o hitbox temporário que cobria toda a janela nativa transparente.
- Durante o arrasto, a ativação usa o retângulo publicado da ilha, sem margem adicional. Recolhido, corresponde à barrinha; durante a abertura, acompanha a geometria animada do notch para permitir soltar sobre o menu.
- O hover normal continua usando a margem de 14 px.
- Removido o período adicional de 400 ms que mantinha a janela toda ativa após a soltura.
- Nenhuma animação ou estilo visual foi alterado.

## Arquivos tocados

- `src-tauri/src/lib.rs`
- `AGENTS.md`
- `docs/context/2026-10-02-edge-mochi-hitbox-drag-bar.md`

## Validações

- Revisão estática da condição de hitbox: arrasto usa margem zero e retângulo animado publicado; hover normal conserva 14 px.
- Não foi executado build ou teste automatizado.

## Problemas conhecidos

- A alteração precisa ser confirmada em runtime no Windows com um arquivo arrastado primeiro sobre a barrinha e depois solto sobre o menu expandido.

## Próximos passos

- Reiniciar `npm run tauri dev` para compilar o backend atualizado.
- Confirmar que arrastar sobre a barrinha abre o menu e que mover o arquivo para o menu aberto não perde o drop.
