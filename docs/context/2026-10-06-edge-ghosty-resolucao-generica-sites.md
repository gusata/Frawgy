# Resolução rápida de nomes de sites

## Objetivo

Definir como aceitar comandos de abertura de sites por nome natural, sem exigir um domínio e sem cadastrar cada site manualmente.

## Estado atual

- `quickChatExplicitWebsiteUrl` abre uma URL HTTP(S) literal ou um domínio completo após um verbo de abertura.
- O único alias sem domínio é GitHub.
- Um nome arbitrário não identifica um domínio de forma determinística; é preciso consultar uma fonte ou já ter um alias salvo.
- A lógica atual não executa ações dentro das páginas.

## Proposta

1. Detectar verbos de abertura de forma genérica e extrair o nome/site.
2. Abrir diretamente URLs, domínios completos e aliases/cache salvos.
3. Para nome ainda desconhecido, lançar imediatamente uma busca no navegador por `site oficial <nome>`; após resolução/escolha, salvar o domínio em cache local para que as próximas aberturas sejam diretas.
4. Opcionalmente, oferecer uma resolução automática do primeiro resultado provável, reconhecendo que isso adiciona uma consulta de rede e pode escolher o site errado.

## Arquivos tocados

- `docs/context/2026-10-06-edge-ghosty-resolucao-generica-sites.md` (este snapshot)

Sem mudanças de implementação ou em `AGENTS.md`.

## Validações

- Inspeção estática das funções `quickChatExplicitWebsiteUrl`, `quickChatCompoundWebsiteRequest` e `runExplicitQuickChatAction` em `src/main.ts`.
- Sem build/testes; esta tarefa definiu opções, não alterou código.

## Próximo passo

Implementar resolução direta para URLs/domínios e aliases salvos, com busca rápida no navegador como fallback para qualquer nome desconhecido. Se o usuário preferir abertura totalmente automática sem escolha do resultado, a resolução via web deve ser adicionada como etapa separada e cacheada.
