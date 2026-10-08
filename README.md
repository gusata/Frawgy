# Edge Ghosty

Um painel rápido para Windows, inspirado na ilha do Coucou. O Edge Ghosty fica preso à borda da tela, abre com hover e reúne controles e pequenos recursos do dia a dia.

## O que tem no painel

- Volume do sistema e controles da faixa de mídia atual.
- Temporizador de foco com duração configurável e pausa.
- Lançador para aplicativos, pastas, endereços e pesquisas na web.
- Ações personalizadas que podem abrir vários destinos.
- Prancheta de texto: capture, fixe, copie de volta ou remova entradas.
- Bolso do Ghosty: solte arquivos, imagens ou texto para guardá-los, abrir depois ou perguntar sobre eles no chat. O arquivo original não é movido nem apagado; o app guarda o caminho.
- Pet personalizável com nome, aparência e acessório. O painel de vidro muda de cor suavemente conforme o humor e o item guardado.
- Abas Home, Pet e Atalhos em três botões compactos no cabeçalho.
- GitHub e Vercel podem mostrar PRs, revisões, CI e implantações recentes. Os tokens ficam no Gerenciador de Credenciais do Windows; as consultas param quando você pausa atualizações pela bandeja.
- Nas sessões locais do Codex, as bolinhas pulsam durante tarefas e Ghosty salta para comemorar quando uma tarefa termina. A conexão mostra uma prévia das alterações em `hooks.json` e cria um backup datado antes de gravar.
- A atividade recente do Codex mostra somente tipos de etapa, nomes de ferramentas e horário; fica em memória e é limitada aos últimos 12 eventos. O resumo de 7 dias guarda apenas contagens e durações locais por até 90 dias.
- Chat rápido do Ghosty em `Ctrl + Shift + Espaço`, com seleção de modelo e nível de raciocínio; `Ctrl + N` inicia outra conversa. O login usa OAuth isolado do Codex, com perfil inicial de leitura; ações que peçam permissões adicionais dependem de aprovação na conversa. Os textos enviados seguem para o serviço Codex/OpenAI da conta. Ao perguntar sobre um arquivo do Bolso, o chat recebe nome, caminho e tamanho; o conteúdo não é anexado automaticamente e uma leitura exige aprovação explícita. Arquivos acima de 25 MiB recebem um aviso recomendado, não um bloqueio técnico.

As preferências, atalhos, histórico de texto, equipe selecionada da Vercel e itens do Bolso ficam no armazenamento local do WebView. As credenciais do GitHub e da Vercel ficam no Gerenciador de Credenciais do Windows; os dados carregados dos serviços ficam em memória e não são enviados para outras contas. O Ghosty só consulta esses serviços: não cria, cancela nem altera implantações ou PRs.

Os hooks locais não registram prompts, respostas, comandos ou resultados de ferramentas. Para um pedido de aprovação explícito, uma descrição curta da ação fica na fila local apenas enquanto a decisão está pendente. A leitura da prancheta acontece quando você escolhe capturar; o app não coleta cada cópia em segundo plano. O texto guardado no Bolso tem limite de 50 mil caracteres; a ação de perguntar envia no máximo os primeiros 6 mil caracteres.

Detalhes sobre dados locais, tokens e chamadas de serviço: [Privacidade e dados locais](docs/PRIVACIDADE.md).

## Instalar no Windows

Baixe o instalador `Edge Ghosty_*_x64-setup.exe` na página de Releases e execute-o. A instalação é feita para sua conta e não exige privilégios de administrador. O instalador inclui o runtime do Visual C++ e verifica o WebView2; se o WebView2 estiver ausente, ele será instalado pela Microsoft, o que exige conexão com a internet.

Para remover o app, use **Configurações do Windows → Aplicativos → Aplicativos instalados → Edge Ghosty → Desinstalar**. A desinstalação remove o programa e preserva as preferências e os dados locais da sua conta do Windows.

Na primeira abertura, o Ghosty mostra um guia rápido para escolher a inicialização com o Windows e os atalhos da Home. Essa escolha pode ser alterada depois nas Configurações.

O chat rápido é opcional e requer o Codex CLI instalado separadamente. Sem ele, o restante do Edge Ghosty continua funcionando; ao abrir o chat, o app informa se não encontrar o CLI.

## Gerar e publicar o instalador

Em um Windows x64 com Node.js 20+, Rust para MSVC e as ferramentas C++ do Visual Studio Build Tools:

```powershell
npm ci
npm run build:windows
```

O instalador `.exe` será criado em `src-tauri/target/release/bundle/nsis/`. Para uma versão do GitHub, sincronize a versão em `package.json`, `src-tauri/Cargo.toml` e `src-tauri/tauri.conf.json`, envie a tag correspondente `vX.Y.Z` e aguarde a Actions `Windows release`: ela compila o instalador e cria um rascunho de Release com o `.exe` anexado. Revise o rascunho e publique-o pela página de Releases.

Os instaladores ainda não são assinados digitalmente; o Windows pode exibir um aviso do SmartScreen ao baixar ou executar uma versão nova.

## Desenvolvimento

Requisitos: Node 20+, Rust e WebView2.

```powershell
npm install
npm run dev
```

Para abrir como app Tauri:

```powershell
npm run tauri dev
```

A interface usa uma janela transparente, uma ilha escura com duas “orelhas” feitas com `radial-gradient` e comandos Win32 para volume, prancheta, mídia e abertura de destinos.
