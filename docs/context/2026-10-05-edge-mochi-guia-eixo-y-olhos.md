# Guia rápido para inverter o eixo vertical do olhar

## Objetivo

Indicar o ponto do motor onde o sinal do olhar vertical do Mochi pode ser ajustado manualmente.

## Orientação

- O cálculo principal fica em `src/pet-motion.ts`, em `drawFace()`, na linha que deriva `pitch` de `greeting.lookY` ou `gazeY`.
- Para inverter a direção vertical sem mexer no eixo horizontal nem no sinal da rotação dos olhos, trocar o multiplicador de `0.5` para `-0.5` nessa linha.
- O parâmetro `lookAt()` recebe coordenadas da tela; inverter ali exigiria alterar cada origem de olhar. `eyeY` calcula a posição resultante e não é o ponto mais restrito para inverter somente o acompanhamento vertical.

## Arquivos tocados

- `docs/context/2026-10-05-edge-mochi-guia-eixo-y-olhos.md` (este snapshot)

## Validação

- Localizado o cálculo `pitch` e conferido o mapeamento até `eyeY` por revisão estática.
- Nenhum código foi alterado; build, testes e inspeção visual não se aplicam.

## Próximos passos

- Se o usuário fizer a troca, conferir o olhar para cima/baixo com cursor e durante a saudação no app.
