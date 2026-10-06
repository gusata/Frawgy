# Snapshot: abrir sites sem passar pelo modelo

## Objetivo

Reduzir a demora e o uso de contexto quando a pessoa pede uma ação direta, como abrir o GitHub no navegador.

## Alterações

- O chat reconhece comandos explícitos em português de abrir/acessar um site, incluindo `abrir o GitHub no navegador` e `ir para github.com`.
- O alias `GitHub` e domínios completos são resolvidos localmente e abertos por `open_targets`, sem iniciar um turno no app-server.
- URLs HTTP(S) coladas continuam no caminho direto. Pedidos vagos que não resolvem para um domínio conhecido continuam com o fluxo do modelo.

## Arquivos tocados

- `src/main.ts`
- `AGENTS.md`
- Este snapshot.

## Validações

- `npm run build` passou.
- Ainda não houve teste manual de frases no popup do Windows.

## Problemas conhecidos e limites

- Um nome desconhecido sem domínio explícito não é transformado automaticamente em `.com`; isso evita abrir um endereço inferido incorretamente.
- A abertura continua usando o navegador padrão do Windows.

## Próximos passos

- Conferir no popup as formas “abrir o GitHub no navegador”, “abrir github.com” e uma URL digitada diretamente.
