# Esclarecimento do alcance da abertura de sites

## Objetivo

Esclarecer quais pedidos a lógica de abertura rápida de sites reconhece e se ela executa ações dentro das páginas.

## Estado do código

- Reconhece uma URL HTTP(S) escrita diretamente.
- Reconhece comandos explícitos como “abrir/acessar/ir para” seguidos por um domínio completo, por exemplo `youtube.com`.
- Tem alias de nome curto somente para “GitHub”/“github.com”. “YouTube” sem `youtube.com` não tem alias próprio.
- Em pedidos compostos como “abrir GitHub e pesquisar...”, abre o domínio reconhecido no navegador e encaminha a continuação ao modelo.
- Não controla a aba, não lê a página e não executa cliques, buscas ou outras ações dentro de nenhum site.

## Arquivos tocados

- `docs/context/2026-10-06-edge-ghosty-alcance-abertura-sites.md` (este snapshot)

Nenhum arquivo de implementação ou `AGENTS.md` foi alterado.

## Validações

- Inspeção estática de `src/main.ts`, funções `quickChatExplicitWebsiteUrl`, `quickChatCompoundWebsiteRequest`, `runExplicitQuickChatAction` e `sendQuickChatMessage`.
- Sem build/testes: nenhuma implementação foi alterada.

## Problemas conhecidos e próximo passo

- A abertura por domínio é apenas uma ação de lançamento do navegador; ações dentro dos sites precisam de uma camada separada de automação do navegador.
- Se for implementado, adicionar aliases de sites conhecidos pode melhorar a abertura direta, mas isso não substitui controle DOM/acessibilidade da página.
