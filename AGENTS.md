# Memória do projeto Edge Mochi

Este arquivo deve ser lido no início de toda nova conversa ou tarefa neste repositório. Ele é a memória operacional do projeto e deve ser atualizado apenas quando houver uma decisão estrutural importante.

## Regra de contexto

Ao concluir cada tarefa, crie um arquivo novo em `docs/context/` com data e identificador diferentes. Nunca sobrescreva um contexto anterior. O arquivo deve registrar objetivo, alterações realizadas, arquivos tocados, validações, problemas conhecidos e próximos passos. O `AGENTS.md` permanece como memória geral; os arquivos em `docs/context/` são snapshots de cada tarefa.

## Projeto

- Nome atual: Edge Mochi.
- Diretório: `C:\Users\gustavo.sanches\Documents\01_Projetos\notchteste\teste`.
- Plataforma alvo: Windows 10/11 x64.
- Stack: Tauri 2, Rust, Vite, TypeScript, HTML/CSS e WebView2.
- Inspiração visual: Coucou, especialmente o notch/island do macOS e as curvas pretas convexas que parecem sair da borda da tela.
- Objetivo: um menu rápido e personalizável na borda do Windows, com visual predominantemente escuro, controles comuns e o Mochi como mascote interativo.

## Visão e requisitos do produto

Estado atual da interface: Home, Pet e Atalhos são acessados por três botões de ícone no cabeçalho. A Home reúne controles rápidos e resumos; Pet mostra o Mochi em destaque e abre bolso/personalização em painéis auxiliares; Atalhos contém lançador e ações.

O menu deve:

- ficar encostado na borda esquerda do monitor;
- aparecer recolhido como uma barrinha/linha vertical discreta;
- usar duas curvas/“orelhas” convexas pretas, com aparência de algo sendo cuspido pela borda;
- expandir suavemente ao passar o mouse;
- recolher suavemente quando o mouse sair;
- manter uma base visual escura; a página do pet pode usar vidro translúcido e gradientes suaves que acompanham seu humor e o tipo de item guardado;
- controlar o volume e a reprodução de mídia do sistema;
- oferecer temporizador de foco, prancheta local, lançador rápido e ações personalizadas;
- permitir guardar arquivos, imagens e textos no Bolso do Mochi sem mover ou apagar os arquivos originais;
- permitir personalizar nome, aparência e acessório do pet;
- possuir três botões de navegação compactos para Home, Pet e Atalhos, junto aos botões de configurações e fechar;
- possuir atalhos rápidos e permitir reordená-los;
- não bloquear cliques em outras aplicações quando estiver recolhido;
- manter animações limpas e discretas.

## Histórico importante

Decisao atual: a navegacao entre abas substitui somente o conteudo do painel, preservando o `.island-body` e a animacao em curso; as orelhas acompanham a geometria atual mesmo com o menu expandido.

1. Foi pesquisado o repositório Coucou (`https://github.com/louis-cfm/coucou`) para entender o design do notch.
2. A curva desejada não é uma concavidade para dentro: é uma curva convexa preta nas extremidades, criando a ilusão de que o menu sai da borda.
3. A hipótese visual adotada foi combinar regiões transparentes com superfícies pretas e `border-radius`/gradientes radiais.
4. O projeto foi criado inicialmente como um app Tauri/Vite.
5. O primeiro erro foi `cargo metadata ... program not found`; Rust/Cargo foram instalados.
6. Depois apareceu `link.exe not found`; foram instalados os Visual Studio 2022 Build Tools com ferramentas C++.
7. O `cargo` passou a funcionar no Developer PowerShell do Visual Studio.
8. O erro seguinte foi `icon.ico not found`; foi criado um ícone ICO placeholder durante o build em `src-tauri/build.rs`.
9. O executável chegou a compilar, mas apresentou `STATUS_ENTRYPOINT_NOT_FOUND` (`0xc0000139`). Foram investigados WebView2 e Visual C++ Runtime.
10. O usuário confirmou WebView2 instalado, MSVC disponível e os redistributables Visual C++ instalados. Também foi usado `dumpbin /dependents` para investigar DLLs.
11. O `npx tauri info` confirmou Tauri 2.12.1, WebView2 154, VS Build Tools 2022, Rust stable MSVC, Node 24 e npm 11.
12. Foi adicionada integração de volume usando WASAPI/Core Audio via crate `windows`.
13. O erro de importação de `IAudioEndpointVolume` foi corrigido: a API pertence a `windows::Win32::Media::Audio::Endpoints`, e foi adicionado o feature `Win32_Media_Audio_Endpoints`.
14. O frontend mantém a janela nativa em dimensões estáveis durante abrir/fechar. `src/anim.ts` porta `Spring`, `Tracked` e a curva cúbica do Coucou; o backend consulta o cursor globalmente e usa `set_ignore_cursor_events` para deixar passar cliques fora da forma animada. `apply_display_layout` inicializa o hitbox recolhido no backend; a geometria animada é sincronizada pelo frontend.
15. A interface ganhou base escura e um pet visual minimalista. O escopo atual do pet é companhia, foco e itens guardados, sem painel de consumo de agentes.
16. A configuração Tauri define `alwaysOnTop: true`; além disso, `place_window` usa `SetWindowPos(HWND_TOPMOST, SWP_NOACTIVATE)` e reaplica `set_always_on_top(true)` ao posicionar, mostrar ou alternar click-through.
17. O polling nativo alterna o click-through, repete a posição do cursor a cada 100 ms enquanto ele está na área de hover e emite mudanças de posição; `pointerenter`/`pointerleave` no `.island-body` também dirigem abrir/recolher no Tauri. Durante uma pressão do botão esquerdo, o hitbox aumenta temporariamente para que o drag-and-drop passe pela janela transparente; a área normal de hover continua estreita. `setExpanded` é idempotente para as duas rotas cobrirem perda de evento sem duplicar a animação.
18. A Home agora reúne volume, mídia, foco, lançador, prancheta, Bolso e um resumo do pet. A navegação usa três botões circulares de ícone no cabeçalho.
19. O pet tem nome, três aparências e dois acessórios configuráveis. Sua aba prioriza o personagem; bolso e personalização abrem em painéis auxiliares. O painel usa vidro com gradiente animado conforme o humor e o tipo do item mais recente no Bolso. O corpo do Mochi tem animação autônoma de respiração e squish.
20. O Bolso aceita arquivos pelo evento nativo de drag-and-drop do Tauri e textos por soltar na área ou ler a prancheta sob ação explícita. Guarda caminhos e texto no `localStorage`, anima o item até o pet e não altera o arquivo original.
21. Atalhos e ações personalizadas são salvos localmente; cada ação pode abrir vários aplicativos, arquivos, pastas ou endereços. Os itens podem ser reordenados.
22. Durante um arrasto com o botão esquerdo pressionado, o hitbox nativo começa exatamente no retângulo publicado da barrinha, sem margem extra, e acompanha a expansão animada do notch. No uso normal, o hover mantém a margem de 14 px. O caminho do arquivo é persistido no Bolso antes da animação de ingestão.
23. O Tauri 2 exige capability `core:event:default` para o frontend registrar `onDragDropEvent` e os eventos de hover/layout. `src-tauri/capabilities/default.json` concede essa permissão e `core:window:default` às janelas `main` e `display-*`; a capability deve continuar referenciada em `tauri.conf.json`.

## Estado atual dos arquivos relevantes

### Frontend

- `src/main.ts`: renderiza o island, navegação, controles de volume/mídia, foco, lançador, prancheta, Bolso e personalização do pet. A aba do pet mantém o personagem em destaque e abre bolso/aparência em painéis auxiliares. Usa `Tracked` de `src/anim.ts`, eventos Tauri para receber arquivos e `localStorage` para preferências e dados locais.
- `src/style.css`: contém a estética escura, orelhas convexas, animações do island e do pet, painel de vidro com gradientes por humor, controles, prancheta, Bolso e atalhos.
- `index.html`: ponto de entrada do frontend.
- `vite.config.ts`, `tsconfig.json`, `package.json`: configuração Vite/TypeScript/Tauri.

### Backend Rust/Tauri

- `src-tauri/src/lib.rs`: comandos de volume, mídia, abertura de destinos, atalhos, hitbox e layout; posicionamento nos monitores selecionados e reafirmação nativa da faixa `TOPMOST`.
- `src-tauri/Cargo.toml`: inclui `windows` com features de áudio, COM, prancheta Win32 (`DataExchange`/`Memory`/`Ole`), entrada de teclado, ShellExecute e `Win32_UI_WindowsAndMessaging`.
- `src-tauri/build.rs`: chama `tauri_build::build()` e gera um `icons/icon.ico` placeholder se o ícone ainda não existir.
- `src-tauri/tauri.conf.json`: janela transparente, sem decoração, sempre no topo, sem taskbar, host inicial 400x720, bundle desativado durante desenvolvimento.

### Comandos nativos

- `system_volume(value)`: usa `CoInitializeEx`, `MMDeviceEnumerator`, endpoint de áudio padrão e `SetMasterVolumeLevelScalar`.
- `get_system_volume()`: consulta o volume do endpoint padrão.
- `media_control(action)`: envia as teclas de mídia de play/pause, faixa anterior e próxima.
- `get_media_info()`: consulta os metadados da sessão de mídia do Windows via Windows Media Control; retorna campos vazios se a consulta não estiver disponível.
- `read_clipboard_text()` e `write_clipboard_text(text)`: leem e escrevem texto na prancheta do Windows usando Win32.
- `open_targets(targets)`: abre destinos de usuário com `ShellExecuteW`, sem montar um comando de terminal.
- `run_shortcut(name)`: abre Terminal (`wt.exe`), Captura (`ms-screenclip:`) ou Foco (`ms-settings:quiethours`).
- `set_island_rect(...)`: publica a geometria atual para o polling nativo de cursor e click-through.
- `apply_display_layout(...)`: posiciona a janela hospedeira em dimensões estáveis para a borda e os monitores selecionados.

## Ambiente confirmado pelo usuário

Saída relevante do `npx tauri info`:

- Windows 10.0.26200 x64.
- WebView2 154.0.4258.48.
- Visual Studio 2022 Build Tools.
- Rust/cargo stable `x86_64-pc-windows-msvc`.
- Node 24.13.1 e npm 11.8.0.
- Tauri 2.12.1, tauri-build 2.7.1, wry 0.57.0 e tao 0.37.1.

## Validações

- `npm run build` passou após as últimas mudanças de frontend.
- A compilação Rust deve ser validada no Developer PowerShell do Visual Studio, pois esse shell possui o ambiente MSVC configurado.
- As funcionalidades adicionadas no snapshot `2026-10-02-edge-mochi-painel-pessoal` ainda precisam de compilação e inspeção no app; essa tarefa não executou build ou testes.
- A margem extra de hover durante arrasto e a nova tela minimalista do Mochi (`2026-10-02-edge-mochi-pet-somente-hover`) também precisam de inspeção em runtime.
- O hitbox temporário para drop e a persistência do Bolso (`2026-10-02-edge-mochi-arrasto-e-bolso`) foram revisados estaticamente; ainda precisam de teste manual no Windows com arquivos reais.
- A permissão Tauri para eventos de arrasto e hover (`2026-10-02-edge-mochi-acl-arrasto`) foi adicionada após identificar que não havia capability no projeto; precisa de reinício e validação manual no Windows.
- O hitbox amplo de arrasto foi reduzido para acompanhar a geometria visível do notch (`2026-10-02-edge-mochi-hitbox-drag-bar`); a margem regular de hover e a animação não foram alteradas.
- Comando recomendado:

```powershell
cd "C:\Users\gustavo.sanches\Documents\01_Projetos\notchteste\teste"
cargo clean --manifest-path .\src-tauri\Cargo.toml
npm run tauri dev
```

## Cuidados para próximas tarefas

- Manter o Edge Mochi como painel rápido geral; o pet pode reagir a foco e itens guardados sem tornar o produto dependente de agentes.
- Preservar o polling nativo do cursor e a janela hospedeira estável durante o hover. Manter também `pointerenter`/`pointerleave` no `.island-body`; o polling pode alternar click-through sem o WebView receber aquele primeiro evento de mouse.
- Preservar `alwaysOnTop: true` e a promoção `HWND_TOPMOST` sem remover `SWP_NOACTIVATE`, para que a janela permaneça no topo sem roubar o foco.
- Usar `apply_patch` para editar arquivos.
- Antes de alterar a arquitetura, verificar este arquivo e o snapshot mais recente em `docs/context/`.
- Ao finalizar uma tarefa, criar um novo snapshot em `docs/context/`.
- Se a compilação Rust falhar, solicitar a mensagem completa do Developer PowerShell e corrigir o código com base nela.
