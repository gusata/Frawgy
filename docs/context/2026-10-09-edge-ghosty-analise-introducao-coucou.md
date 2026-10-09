# Análise da introdução do Coucou

## Objetivo

Analisar a saudação de lançamento do Coucou, com atenção à coreografia e às partículas, e compará-la ao onboarding visual atual do Edge Ghosty.

## Alterações realizadas

- Registrada a análise em `docs/design/coucou-introducao-animacao-2026-10-09.md`.
- A conclusão principal é que os efeitos de partículas do Coucou são sincronizados com a queda e o pouso: riscos verticais curtos e um anel branco único. Não são confetes genéricos.
- Comparado o efeito sequencial do Coucou às seis partículas decorativas em CSS e ao movimento Canvas de boas-vindas do Ghosty.
- Nenhum arquivo de produto ou decisão estrutural foi alterado.

## Arquivos tocados

- `docs/design/coucou-introducao-animacao-2026-10-09.md` — relatório da análise.
- `docs/context/2026-10-09-edge-ghosty-analise-introducao-coucou.md` — este snapshot.

## Validações

- Leitura estática do `windows/src/mochi/greeting.ts` atual no GitHub e das notas da versão 0.1.5.
- Inspeção local de `src/main.ts`, `src/style.css` e `src/pet-motion.ts` para comparar o onboarding do Ghosty.
- Nenhum teste ou build foi executado; não houve alteração de código.

## Problemas conhecidos

- A análise é baseada no código; não foi feita captura visual da animação em execução.
- O clone local do Coucou está no commit `0aae11b` e possui uma revisão anterior das partículas. O relatório identifica essa diferença e segue o `main` consultado em 2026-10-09.

## Próximos passos

- Se a animação do Ghosty for revisada, avaliar um efeito curto de entrada e um pulso de pouso sincronizados ao Canvas, preservando a silhueta, a paleta e o conteúdo do onboarding existentes.
- Conferir o resultado no runtime Windows, inclusive interrupção da saudação e preferência por movimento reduzido.
