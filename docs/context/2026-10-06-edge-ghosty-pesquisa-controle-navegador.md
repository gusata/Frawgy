# Pesquisa: controle de ações dentro do navegador

## Objetivo

Pesquisar padrões usados por projetos de agentes de navegador para tornar ações em sites (por exemplo, GitHub ou YouTube) rápidas e fluidas, e relacioná-los ao Edge Ghosty.

## Conclusões

- O fluxo atual do Ghosty abre destinos no navegador padrão e pode usar pesquisa web do Codex, mas não controla a página aberta nem executa cliques dentro dela.
- Projetos de automação como Playwright MCP usam uma sessão de navegador persistente e referências semânticas da árvore de acessibilidade/DOM. Essas referências permitem localizar controles por nome e tipo, sem depender sempre de coordenadas ou screenshots; devem ser renovadas após alterações de página porque ficam obsoletas.
- Playwright MCP documenta perfis persistentes, isolados ou conexão a um navegador existente por extensão. O perfil persistente conserva os logins entre sessões.
- Padrão indicado para o Ghosty: sessão de navegador própria, com perfil persistente, e ferramentas de escopo estreito como navegar, obter snapshot, localizar, clicar, digitar e rolar. O modelo recebe uma árvore acessível compacta e só precisa reavaliar a página após navegação ou mudança de estado. Isso reduz chamadas e contexto em comparação com uma estratégia só de screenshot e coordenadas.
- Alternativa: conectar uma extensão ao Chrome/Edge existente para aproveitar logins. É mais conveniente, mas concede acesso a abas e sessões existentes; deve ser limitada a uma aba escolhida pelo usuário.
- WebView2/Tauri oferece uma base para uma janela de navegador própria, mas a escolha entre sessão própria e navegador existente é uma decisão de produto ainda pendente.
- Ações de leitura, navegação e busca podem ser executadas diretamente. Ações com efeito externo (publicar, apagar, curtir, comprar ou alterar dados) devem exigir confirmação explícita.

## Arquivos tocados

- `docs/context/2026-10-06-edge-ghosty-pesquisa-controle-navegador.md` (este snapshot)

Nenhum arquivo de implementação ou `AGENTS.md` foi alterado nesta tarefa.

## Validações

- Pesquisa web em documentação e repositórios oficiais: Microsoft Playwright MCP, Browser Use, Open Interpreter, Tauri e OpenAI.
- Sem build/testes: a tarefa foi de pesquisa e não alterou código.

## Problemas conhecidos

- O Ghosty ainda não possui integração de controle de páginas web. Abrir um site e enviar a continuação ao modelo não executa ações dentro da página.
- A integração de navegador deve decidir se usa um perfil persistente próprio ou se conecta ao navegador atual do usuário.
- A autenticação do app-server do Codex via plano ChatGPT não fornece, por si só, controle do navegador; será necessário implementar um executor de navegador separado.

## Referências consultadas

- Playwright MCP: https://github.com/microsoft/playwright-mcp
- Snapshots semânticos e ciclo de vida das referências: https://github.com/microsoft/playwright.dev/blob/main/mcp/snapshots.mdx
- Browser Use: https://github.com/browser-use/browser-use
- Open Interpreter browser extension e arquitetura: https://github.com/openinterpreter/interpreter-extension e https://github.com/openinterpreter/interpreter-workstation/blob/main/docs/overlay-architecture.md
- Tauri WebviewWindow: https://v2.tauri.app/reference/javascript/api/namespacewebviewwindow/
- OpenAI computer use: https://developers.openai.com/api/docs/guides/tools-computer-use
- Codex app-server com login do plano ChatGPT: https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server

## Próximo passo

Escolher entre navegador próprio persistente (mais isolado e previsível) e conexão a uma aba existente do Chrome/Edge (reaproveita login); então implementar a camada de ferramentas de navegador com snapshots semânticos e permissões por ação.
