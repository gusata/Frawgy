# Cache rápido e resolução de nomes de sites

## Objetivo

Abrir sites pedidos por nome em linguagem natural, sem fazer uma chamada ao modelo em cada uso, e manter buscas de sites desconhecidos separadas do contexto da conversa.

## Alterações realizadas

- URLs, domínios completos, aliases comuns e nomes já resolvidos são reconhecidos localmente e abertos sem chamada ao modelo.
- Nomes desconhecidos usam um thread separado do Codex app-server, com esforço baixo e somente leitura, para procurar o site oficial e retornar uma URL em JSON.
- Se a busca não confirmar uma URL confiável, o Ghosty abre uma busca na web para o usuário escolher.
- URLs confiáveis são persistidas num registro JSON compacto no `localStorage`, com até 256 nomes; a interface carrega o registro uma vez para uma `Map` em memória e sincroniza alterações entre janelas.
- Em pedidos compostos, a abertura acontece primeiro e a continuação é enviada em um único turno à conversa principal.

## Arquivos tocados

- `src/main.ts`
- `src-tauri/src/codex_chat.rs`
- `src-tauri/src/lib.rs`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-cache-sites-resolver.md`

## Validações

- `npm run build` — passou.
- `cargo check --manifest-path .\src-tauri\Cargo.toml` — passou.
- `git diff --check` — passou; Git apenas avisou sobre a normalização LF/CRLF dos arquivos modificados.

## Problemas conhecidos

- O primeiro acesso a um nome desconhecido depende da busca web pelo app-server e pode demorar mais que a abertura local; os acessos seguintes usam cache.
- O fluxo com OAuth, busca real, abertura pelo cache e fallback ambíguo ainda precisa de inspeção manual no Windows.
- Esta implementação abre o site; não automatiza cliques ou navegação dentro de qualquer página.

## Próximos passos

- Inspecionar manualmente com uma conta ChatGPT conectada: pesquisar um nome desconhecido, repetir para confirmar abertura direta pelo cache e conferir o fallback de uma busca ambígua ou indisponível.
- Para operar elementos dentro de sites, avaliar automação de navegador no próprio app sem extensão; isso é um escopo separado da abertura rápida de endereços.
