# Implementação das recomendações da auditoria Coucou

## Objetivo

Aplicar no Edge Ghosty os aprendizados pertinentes do Coucou: revisão segura dos hooks, atividade curta com escopo de privacidade claro, uma integração adicional de serviço, respeito à pausa global, documentação de dados e limites claros no fluxo de arquivos do Bolso para o chat. Preservar a identidade própria do Ghosty e não copiar flags privadas do WebView2.

## Alterações realizadas

- O fluxo de conexão, atualização e desconexão do Codex agora mostra a prévia das entradas do Ghosty por evento, exige confirmação, verifica se `hooks.json` mudou desde a prévia e cria backup datado antes de substituir um arquivo existente. Uma atualização do helper local também requer revisão explícita.
- A atividade recente do Codex fica apenas em memória, com até 12 eventos e sem nomes de sessão, prompts, respostas, comandos ou resultados. O resumo agregado continua local e retém no máximo 90 dias.
- Foi adicionada integração de leitura da Vercel: token no Gerenciador de Credenciais do Windows, filtro opcional por equipe, até cinco implantações, snapshots em memória e atualização periódica. As integrações GitHub e Vercel respeitam a pausa também no backend, inclusive para refresh manual e validação de tokens.
- O handoff do Bolso ao chat consulta apenas metadados do arquivo, mostra nome, caminho e tamanho e não anexa os bytes automaticamente. Arquivos acima de 25 MiB recebem aviso recomendado. Texto guardado tem limite de 50.000 caracteres e a ação de perguntar envia até 6.000.
- README e política de privacidade explicam a transferência de mensagens ao serviço Codex/OpenAI, os limites do texto, o aviso não obrigatório para arquivos grandes e a exigência de aprovação para leitura de arquivos.
- A configuração do Ghosty foi revista: não usa `additionalBrowserArgs`; manter flags privadas do WebView2 fora do produto.

## Arquivos tocados

- `src-tauri/src/codex_hooks.rs`
- `src-tauri/src/credentials.rs`
- `src-tauri/src/github.rs`
- `src-tauri/src/vercel.rs`
- `src-tauri/src/lib.rs`
- `src/main.ts`
- `src/style.css`
- `README.md`
- `docs/PRIVACIDADE.md`
- `AGENTS.md`
- Este snapshot em `docs/context/`.

## Validações

- Revisão estática dos caminhos de preview/backup dos hooks, armazenamento de credenciais, chamadas REST, guards de pausa, handoff do Bolso e documentação.
- Não foram executados builds ou testes nesta tarefa.

## Problemas conhecidos

- A consulta de metadados não lê bytes do arquivo. O aviso de 25 MiB é orientação, não uma barreira técnica: se o usuário aprovar uma solicitação posterior de leitura do Codex, o serviço do provedor pode processar esse conteúdo.
- A integração Vercel, o fluxo de backup dos hooks, as atualizações em pausa/retomada e a janela do chat ainda precisam de inspeção manual no Windows.
- Uma chamada HTTP iniciada antes de pausar não é cancelada no meio; o backend bloqueia novas etapas de rede e não publica snapshots após perceber a pausa.

## Próximos passos

- Em uma solicitação de validação, executar build frontend e Rust no Developer PowerShell e inspecionar os fluxos no Windows: conectar/desconectar Codex, alteração concorrente de `hooks.json`, Vercel pessoal/equipe, pausa durante atualização e handoff de arquivos abaixo/acima de 25 MiB.
