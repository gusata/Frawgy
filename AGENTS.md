# Memória do projeto Edge Ghosty

Este arquivo deve ser lido no início de toda nova conversa ou tarefa neste repositório. Ele é a memória operacional do projeto e deve ser atualizado apenas quando houver uma decisão estrutural importante.

## Regra de contexto

Ao concluir cada tarefa, crie um arquivo novo em `docs/context/` com data e identificador diferentes. Nunca sobrescreva um contexto anterior. O arquivo deve registrar objetivo, alterações realizadas, arquivos tocados, validações, problemas conhecidos e próximos passos. O `AGENTS.md` permanece como memória geral; os arquivos em `docs/context/` são snapshots de cada tarefa.

## Projeto

- Nome atual: Edge Ghosty.
- Diretório: `C:\Users\gustavo.sanches\Documents\01_Projetos\notchteste\teste`.
- Plataforma alvo: Windows 10/11 x64.
- Stack: Tauri 2, Rust, Vite, TypeScript, HTML/CSS e WebView2.
- Inspiração visual: Coucou, especialmente o notch/island do macOS e as curvas pretas convexas que parecem sair da borda da tela.
- Objetivo: um menu rápido e personalizável na borda do Windows, com visual predominantemente escuro, controles comuns e o Ghosty como mascote interativo.

## Visão e requisitos do produto

Estado atual da interface: Home, Pet e Atalhos são acessados por três botões de ícone no cabeçalho. A Home horizontal mostra somente mídia, volume e alguns atalhos, em um cartão sem rolagem; Pet mostra o Ghosty em destaque; foco, Bolso, personalização e prancheta abrem um popup nativo separado da ilha. Atalhos contém lançador e ações.

O menu deve:

- ficar encostado na borda esquerda do monitor;
- aparecer recolhido como uma barrinha/linha vertical discreta;
- usar duas curvas/“orelhas” convexas pretas, com aparência de algo sendo cuspido pela borda;
- expandir suavemente ao passar o mouse;
- recolher suavemente quando o mouse sair;
- manter uma base visual escura; a página do pet pode usar vidro translúcido e gradientes suaves que acompanham seu humor e o tipo de item guardado;
- controlar o volume e a reprodução de mídia do sistema;
- oferecer temporizador de foco, prancheta local, lançador rápido e ações personalizadas;
- permitir guardar arquivos, imagens e textos no Bolso do Ghosty sem mover ou apagar os arquivos originais;
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
19. O pet tem nome, três aparências e dois acessórios configuráveis. Sua aba prioriza o personagem; bolso e personalização abrem em painéis auxiliares. O painel usa vidro com gradiente animado conforme o humor e o tipo do item mais recente no Bolso. O desenho e os movimentos do Ghosty são renderizados por Canvas 2D em `src/pet-motion.ts`; o botão HTML preserva acessibilidade e clique.
20. O Bolso aceita arquivos pelo evento nativo de drag-and-drop do Tauri e textos por soltar na área ou ler a prancheta sob ação explícita. Guarda caminhos e texto no `localStorage`, anima o item até o pet e não altera o arquivo original.
21. Atalhos e ações personalizadas são salvos localmente; cada ação pode abrir vários aplicativos, arquivos, pastas ou endereços. Os itens podem ser reordenados.
22. Durante um arrasto com o botão esquerdo pressionado, o hitbox nativo começa exatamente no retângulo publicado da barrinha, sem margem extra, e acompanha a expansão animada do notch. No uso normal, o hover mantém a margem de 14 px. O caminho do arquivo é persistido no Bolso antes da animação de ingestão.
23. O Tauri 2 exige capability `core:event:default` para o frontend registrar `onDragDropEvent` e os eventos de hover/layout. `src-tauri/capabilities/default.json` concede essa permissão e `core:window:default` às janelas `main` e `display-*`; a capability deve continuar referenciada em `tauri.conf.json`.
24. Em `2026-10-05-edge-mochi-canvas-engine`, o personagem passou de peças HTML/keyframes CSS para um renderer Canvas 2D com canais independentes, tweens interrompíveis, easing, olhar suavizado por `dt`, piscadas e microgestos. `src/anim.ts` continua dedicado à geometria da ilha.
25. Em `2026-10-05-edge-mochi-seixo-vivo`, a direção visual do personagem foi definida como um seixo abstrato assimétrico com olhos pretos grandes e duas mãos laterais; sem orelhas, focinho, boca ou bochechas. A silhueta e os detalhes devem continuar distintos do Coucou.
26. Em `2026-10-05-edge-mochi-grok-coucou-animacoes`, o olho padrão foi definido como uma cápsula vertical preta chapada, sem reflexo especular. `src/pet-motion.ts` adapta o repertório de animação do Ghosty inspirado no Coucou: estados idle/working/thinking/searching/approval/question/error/finished/ratelimit/sleeping/dizzy; emotes love/surprised/proud/wink/yawn/happy/annoyed; piscada, olhar, respiração, aceno, squash, giro, partículas e morph breve durante a ingestão. As formas de olhos e os gestos são desenhados no Canvas; acessórios mantêm o estilo do Edge Ghosty.

27. Em `2026-10-05-edge-mochi-maos-e-engolida`, as maos ficam invisiveis em repouso e so aparecem durante gestos. A boca nao faz parte da expressao normal: ao receber um arquivo, o corpo vira uma forma de caixa e abre uma fenda horizontal no topo, fechando para a sequencia de mastigacao quando o item e solto. Ao cancelar o arrasto, a fenda, as maos e a morph recolhem. Essa excecao temporaria atualiza a decisao do item 25 sem mudar a identidade fantasiosa do personagem; os olhos continuam capsulas pretas foscas sem reflexos.

28. Em `2026-10-05-edge-mochi-port-comportamentos-coucou`, o motor Canvas incorpora as animações do Ghosty inspiradas no Coucou que cabem no Edge: estados e badges, piscadas, olhar, partículas, aceno curto e saudação longa, reação a toques, acompanhamento horizontal do arquivo e sequência de sucção/mastigação. Os gatilhos ficam ligados a ações reais do Edge (`working`/`finished` no foco, `searching` na busca, saudação ao abrir, carinho no hover e reação a cliques/arquivos). Estados sem equivalente no produto não recebem gatilhos artificiais. Preservar o seixo assimétrico, olhos pretos foscos e mãos ocultas em repouso; não adicionar a barra de progresso do upload nem modos de ilha do Coucou.
29. Em `2026-10-05-edge-mochi-home-horizontal-enxuta`, a Home foi simplificada por pedido do usuário para o formato horizontal: controles de mídia, volume e três atalhos salvos, sem rolagem. Busca e lançador ficam em Atalhos; Foco segue disponível por atalho. Usar uma superfície principal e poucos controles. Preservar a ilha e o motor de animação.
30. Em `2026-10-05-edge-mochi-popup-fluxos-secundarios`, Foco, Bolso, personalização e prancheta passaram para a janela Tauri `utility-popup`, independente da ilha. A janela usa o mesmo `localStorage` para sincronizar estado; fecha pelo botão, Escape ou perda de foco. O atalho Foco inicia/retoma o temporizador e abre seus controles.
31. Em `2026-10-05-edge-mochi-popup-arrastavel-tamanho-borda`, o popup foi reduzido para 400x500 logical px, pode ser arrastado pelo título e persiste sua posição física em `localStorage`; ao reabrir, a posição é limitada ao monitor disponível. A borda branca do cartão foi removida. O popup fica opaco por padrão (`transparent: false`, fundo CSS escuro); para vidro translúcido, ativar a transparência Tauri e reduzir `--utility-popup-opacity` em `src/style.css`. Manter `shadow: false` no Windows para evitar a borda nativa de 1 px.

32. Em `2026-10-05-edge-mochi-codex-presenca`, a integração com sessões locais do Codex é ativada pelo usuário em Configurações e registra hooks de ciclo de vida no `hooks.json` do usuário. O hook local mantém eventos, nomes de ferramentas e tipos de subagente numa fila temporária no diretório local do app; prompt, resposta e resultados de ferramentas não são guardados nem enviados. O fluxo de aprovação acrescenta somente um resumo truncado da ação pendente, mantido localmente enquanto aguarda a decisão ou expira. O frontend converte esses eventos em estados já existentes do Ghosty. Ao desconectar, remover somente os handlers do Edge Ghosty, preservar os hooks existentes e desligar imediatamente o helper por um marcador local.

33. Em `2026-10-06-edge-ghosty-terminal-conclusao`, a marca ativa passou a Edge Ghosty. Os hooks locais do Codex animam as três bolinhas enquanto uma tarefa está ativa e fazem o Ghosty saltar para fora da barra quando recebe `Stop`. As preferências antigas são migradas de `edge-mochi.*` para `edge-ghosty.*`, o nome padrão anterior vira “Ghosty” e os hooks instalados com o nome antigo continuam reconhecidos para remoção. O identificador Tauri permanece estável para manter os dados locais existentes.

34. Em `2026-10-06-edge-ghosty-aprovacoes`, somente `PermissionRequest` roda como hook síncrono e aguarda até 570 segundos por uma escolha explícita no Ghosty. Aprovar e recusar retornam decisões reais ao Codex; sem heartbeat do app, ao desconectar ou ao expirar, o hook não decide e deixa o fluxo normal do Codex continuar. Com a ilha recolhida, o aviso externo fica clicável por meio do hitbox nativo; com a ilha aberta, o pedido aparece sobre a área do Ghosty. Avisos de conclusão aparecem somente com o menu fechado. O resumo de ação da aprovação fica apenas na fila/memória local enquanto o pedido está ativo.

## Estado atual dos arquivos relevantes

### Frontend

- `src/main.ts`: renderiza a ilha, navegação e mídia/volume/atalhos na Home; abre Foco, Bolso, personalização e prancheta na janela `utility-popup`. Salva a posição da janela quando ela é arrastada. Encaminha eventos do pet ao motor Canvas, usa `Tracked` de `src/anim.ts`, eventos Tauri para receber arquivos e `localStorage` para preferências e dados locais. Configura os hooks do Codex, anima as bolinhas durante tarefas ativas, mostra avisos de conclusão somente quando a ilha está fechada e encaminha escolhas de aprovação explícitas.
- `src/pet-motion.ts`: desenha o Ghosty no Canvas 2D e controla seus canais de movimento, estados e emotes, olhos-cápsula sem reflexos, olhar, piscadas, morph de ingestão e gestos das mãos.
- `src/style.css`: contém a estética escura, orelhas convexas e animações do island, o layout dos canvases do pet, painel de vidro com gradientes por humor, controles, prancheta, Bolso e atalhos.
- `index.html`: ponto de entrada do frontend.
- `vite.config.ts`, `tsconfig.json`, `package.json`: configuração Vite/TypeScript/Tauri.

### Backend Rust/Tauri

- `src-tauri/src/lib.rs`: comandos de volume, mídia, abertura de destinos, atalhos, hitbox, layout e exibição/posicionamento do popup; posicionamento nos monitores selecionados e reafirmação nativa da faixa `TOPMOST`.
- `src-tauri/src/codex_hooks.rs` e `src-tauri/src/codex-hook.ps1`: instalam/removem os hooks de sessão do Codex preservando as outras entradas de `hooks.json`; enviam eventos e resumos de aprovação pela fila local; aguardam e retornam `allow`/`deny` somente em `PermissionRequest`, com fallback ao Codex se Ghosty não responder.
- `src-tauri/Cargo.toml`: inclui `windows` com features de áudio, COM, prancheta Win32 (`DataExchange`/`Memory`/`Ole`), entrada de teclado, ShellExecute e `Win32_UI_WindowsAndMessaging`.
- `src-tauri/build.rs`: chama `tauri_build::build()` e gera um `icons/icon.ico` placeholder se o ícone ainda não existir.
- `src-tauri/tauri.conf.json`: ilha transparente, sem decoração e sempre no topo; popup opaco inicial 400x500, sem decoração/sombra e sempre no topo; bundle desativado durante desenvolvimento.
- A configuração Tauri também declara a janela oculta `utility-popup`; `src-tauri/capabilities/default.json` inclui essa janela e permite ocultá-la e arrastá-la pelo frontend. `src-tauri/gen/schemas/capabilities.json` reflete a capability gerada.

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
- A margem extra de hover durante arrasto e a nova tela minimalista do Ghosty (`2026-10-02-edge-mochi-pet-somente-hover`) também precisam de inspeção em runtime.
- O hitbox temporário para drop e a persistência do Bolso (`2026-10-02-edge-mochi-arrasto-e-bolso`) foram revisados estaticamente; ainda precisam de teste manual no Windows com arquivos reais.
- A permissão Tauri para eventos de arrasto e hover (`2026-10-02-edge-mochi-acl-arrasto`) foi adicionada após identificar que não havia capability no projeto; precisa de reinício e validação manual no Windows.
- O hitbox amplo de arrasto foi reduzido para acompanhar a geometria visível do notch (`2026-10-02-edge-mochi-hitbox-drag-bar`); a margem regular de hover e a animação não foram alteradas.
- O renderer Canvas do Ghosty (`2026-10-05-edge-mochi-canvas-engine`) foi revisado estaticamente; ainda precisa de build e inspeção visual no Windows nos tamanhos compacto/grande e com `prefers-reduced-motion`.
- O popup de utilitários (`2026-10-05-edge-mochi-popup-fluxos-secundarios`) foi revisado estaticamente; ainda precisa de compilação Rust e inspeção no Windows, inclusive drag-and-drop no Bolso e sincronização do foco.
- A janela arrastável e a restauração da posição do popup (`2026-10-05-edge-mochi-popup-arrastavel-tamanho-borda`) ainda precisam de confirmação manual no runtime do Windows.
- A integração de presença do Codex (`2026-10-05-edge-mochi-codex-presenca`) foi revisada estaticamente; ainda precisa de compilação no Developer PowerShell, reinício do Codex, aprovação do hook se solicitada e inspeção das reações em runtime.
- A reação da barra às tarefas e o salto de conclusão do Ghosty (`2026-10-06-edge-ghosty-terminal-conclusao`) passaram por `npm run build`; ainda precisam de inspeção visual no Windows com o hook do Codex ativo e nas três bordas disponíveis.
- As aprovações contextuais do Ghosty (`2026-10-06-edge-ghosty-aprovacoes`) passaram por `npm run build` e `cargo check`; ainda precisam de inspeção no Windows com o Codex reiniciado e o hook atualizado aprovado, verificando ambos os modos da ilha e o fallback de timeout/desconexão.
- A compilação completa do app e a inspeção no runtime Windows continuam pendentes para fluxos que dependem do MSVC e do WebView2.
- Comando recomendado:

```powershell
cd "C:\Users\gustavo.sanches\Documents\01_Projetos\notchteste\teste"
cargo clean --manifest-path .\src-tauri\Cargo.toml
npm run tauri dev
```

## Cuidados para próximas tarefas

- Manter o Edge Ghosty como painel rápido geral; o pet pode reagir a foco, tarefas do Codex e itens guardados sem tornar o produto dependente de agentes.
- Preservar o polling nativo do cursor e a janela hospedeira estável durante o hover. Manter também `pointerenter`/`pointerleave` no `.island-body`; o polling pode alternar click-through sem o WebView receber aquele primeiro evento de mouse.
- Preservar `alwaysOnTop: true` e a promoção `HWND_TOPMOST` sem remover `SWP_NOACTIVATE`, para que a janela permaneça no topo sem roubar o foco.
- Ao alterar hitboxes de avisos externos, preservar o click-through fora da barrinha e incluir somente os botões de aprovação visíveis no retângulo interativo. Nunca aprovar automaticamente: sem resposta explícita no Ghosty, deixar o Codex apresentar seu fluxo normal.
- Manter o desenho e os movimentos do Ghosty em Canvas 2D no `src/pet-motion.ts`; `src/style.css` cuida do tamanho e posicionamento do canvas, enquanto `src/anim.ts` continua cuidando apenas da geometria do island.
- Manter Foco, Bolso, personalização e prancheta na janela `utility-popup`; não reincorporar esses fluxos no corpo animado da ilha sem uma mudança de produto deliberada.
- Manter o popup arrastável pelo título, salvar a posição, o cartão sem borda CSS e `shadow: false`; ajustar a opacidade em `--utility-popup-opacity`. A transparência real da janela depende de `transparent: true` em `src-tauri/tauri.conf.json` e fundo externo CSS transparente.
- Usar `apply_patch` para editar arquivos.
- Antes de alterar a arquitetura, verificar este arquivo e o snapshot mais recente em `docs/context/`.
- Ao finalizar uma tarefa, criar um novo snapshot em `docs/context/`.
- Se a compilação Rust falhar, solicitar a mensagem completa do Developer PowerShell e corrigir o código com base nela.
