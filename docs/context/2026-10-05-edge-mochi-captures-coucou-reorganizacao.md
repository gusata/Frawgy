# Menus do Edge Mochi inspirados nas capturas do Coucou

## Objetivo

Refazer a apresentação dos menus usando as capturas de `design/captures` do Coucou como referência visual principal, preservando os recursos do Edge Mochi e sem alterar a ilha nem as animações do Mochi.

## Leitura da referência

- As telas 03–08, 11–16 usam uma grande superfície carvão dentro do contorno preto da ilha, com bastante espaço e poucas camadas visuais.
- O conteúdo tem hierarquia tipográfica clara: título forte, explicação em cinza mais suave e ações em botões arredondados.
- Resultados aparecem em linhas largas e discretas; ações secundárias usam pílulas e chips compactos.
- As telas de arrasto 09–12 mantêm a mesma superfície e mudam o conteúdo conforme o estado do arquivo.
- As capturas 01 e 02 mostram a apresentação compacta; `no_notch_hidden` e `no_notch_compact` registram a variação sem ilha.

## Alterações realizadas

- Reorganizei a Home em um cartão contextual único com o Mochi, foco, mídia e volume, busca e apps rápidos, Bolso e prancheta.
- Reestruturei Atalhos em um cartão amplo, com busca, apps em chips e atalhos personalizados em linhas.
- Dei às Configurações a mesma linguagem de uma superfície única com grupos de controles separados por divisórias discretas.
- Mantive os seletores e ações usados pelos controles existentes, inclusive temporizador, reprodução, volume, busca, Bolso, prancheta e reordenação de atalhos.
- Não alterei `src/pet-motion.ts`, as regras da ilha, o hitbox, nem as curvas, transições ou keyframes existentes.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-05-edge-mochi-captures-coucou-reorganizacao.md`

## Validações

- Inspecionei visualmente as capturas de menu 01–16 e as duas capturas sem ilha em `design/captures`.
- Revisei os templates, estilos e seletores das ações no código.
- A árvore de acessibilidade do app Tauri já aberto refletiu os novos textos e controles da Home após o hot reload.
- A captura de tela do app transparente mostrou o conteúdo da janela que estava atrás, então não serviu para conferir pixels da interface.
- Não executei build nem testes.

## Problemas conhecidos e próximos passos

- Fazer uma revisão visual manual no Windows, principalmente nos layouts horizontais e na rolagem dos cartões.
- A captura atual não permitiu confirmar se todo o conteúdo cabe sem rolagem na janela horizontal.
- Ajustar espaçamentos ou quebra de texto com base nessa revisão, sem tocar na ilha ou no motor de animação.
