# Auditoria profunda: Coucou e Edge Ghosty

Data: 2026-10-07  
Identificador: edge-ghosty-auditoria-profunda-coucou

## Objetivo

Inspecionar o repositório Coucou baixado pelo usuário e comparar sua implementação com o Edge Ghosty. A análise separa recursos por plataforma, verifica os fluxos reais no código em vez de atribuir ao Windows tudo o que aparece no README principal, avalia arquitetura, segurança, privacidade, distribuição, documentação e licenças, e registra oportunidades que fazem sentido para o produto Ghosty.

## Repositório e escopo

- Repositório: `https://github.com/louis-cfm/coucou`.
- Cópia local temporária: `C:\Users\GUSTAV~1.SAN\AppData\Local\Temp\edge-ghosty-coucou-review-20261007`.
- Revisado no commit `20e1f8b9def2b0d29f7c074eace1f7af9ce124bb` (`Demo mode for App Review (#276)`), correspondente a `origin/main` na data da auditoria. A cópia estava limpa.
- Inventário: 382 caminhos rastreados; aproximadamente 193 arquivos de código e 47,6 mil linhas de código. O repositório também contém documentação, arquivos de projeto, fluxos CI, protótipos, capturas, imagens, ícones e áudio.
- Áreas cobertas: raiz e documentação; build Tauri Windows/Linux; frontend da ilha, Ghosty/Mochi e views; backend Rust, integrações, chat, arquivos, hooks, IPC e bandeja; app macOS Swift; app iPhone e sincronização; widgets; relay Cloudflare; scripts e testes.
- A inspeção foi estática. Não foram executados builds ou testes. Arquivos binários foram inventariados por tipo e área; não foram tratados como código-fonte para leitura linha a linha.

## Parecer

O Coucou é uma referência forte de hierarquia visual, estados de personagem e integração entre uma ilha compacta e serviços. Mas não é um único produto com o mesmo conjunto de recursos em todas as plataformas: o macOS concentra a implementação mais completa, o iPhone depende do ecossistema Apple e o build Windows é uma edição menor. A comparação correta para o Edge Ghosty é principalmente com `windows/`, usando o Mac e o iPhone como referências opcionais de produto.

Para o escopo Windows, o Edge já tem um conjunto mais orientado a utilidade cotidiana e integração com Codex: controle de volume e mídia do sistema, Foco, Bolso que guarda referências sem alterar os arquivos originais, ilha configurável por borda/monitor e chat Codex com OAuth e pedidos explícitos de permissão. As novidades locais atuais também cobrem bandeja/pausa, tons opcionais, estatísticas locais, passagem de itens do Bolso ao chat e integração GitHub mais rica. Portanto, várias lacunas que apareciam em comparações antigas já foram fechadas.

O maior valor que ainda vale estudar é a qualidade do fluxo de instalação/revisão de hooks, um ticker compacto de atividade com limites de privacidade definidos, e integrações de serviços além do GitHub. Não recomendo perseguir paridade indiscriminada com recursos exclusivos de macOS/iPhone nem acrescentar integrações de agentes: a decisão atual do projeto é manter a integração centrada em Codex.

## O que existe no Coucou por plataforma

### Windows e Linux — `windows/`

- App Tauri 2 com frontend TypeScript sem framework e backend Rust; ilha horizontal no topo, animação, click-through, seleção de monitor e abertura por interação.
- Bandeja de sistema com abrir, configurações, pausar, sair e opção de iniciar com o sistema. Pausar é descrito como suspensão real das consultas de rede, não apenas ocultar a ilha.
- Mochi em Canvas com estados, saudações, gestos, miniaturas por agente e sons. O guarda-roupa extenso documentado no produto Mac não está no build Windows.
- Relay de hooks genérico para representar sessões de ferramentas de desenvolvimento. No Windows a presença de agentes externos não equivale a suporte universal a aprovações: o fluxo de permissão interativo é voltado a Claude Code; a solicitação de um agente externo volta ao terminal. AskUserQuestion também precisa ser respondida no terminal. A tela de aprovação Windows oferece Allow/Deny, sem uma regra “Always”.
- Instalação de hooks com visualização de diff, cópia de segurança datada, verificação de fingerprint contra alterações concorrentes, merge que preserva entradas de outros programas e gravação somente após confirmação. O relay usa canal IPC local, autenticação do usuário, limites de tamanho/tempo e fallback para o terminal se o app não responder.
- Chat do Claude via API Anthropic, com chave no armazenamento seguro do sistema, escolha de modelo, pesquisa web e envio de arquivo por ação do usuário. O arquivo é copiado para um inbox temporário e cópias antigas são limpas depois de sete dias. Arquivos binários são enviados em base64; o limite de texto é explícito, mas não identifiquei limite equivalente para o tamanho dos anexos binários.
- Sete integrações configuráveis por API: Stripe, GitHub, Vercel, n8n, Resend, Notion e Cal.com. São pollers de leitura para cards de estado. As vistas são menores que as do Mac; por exemplo, o painel de GitHub Windows não tem o conjunto completo de PRs, revisões e CI da implementação Mac.
- No Linux, a janela e a descoberta do cursor dependem de capacidades do compositor; o comportamento não é necessariamente equivalente ao Windows/macOS.

### macOS — `NotchBuddy/Sources/`

- App nativo SwiftUI/`NSPanel`, adaptação para telas com e sem notch, companion Mochi, mais estados e ações do sistema.
- Hook server com validações de sessão e pedido, instalação revisável, ticker de atividade e ferramenta de diff para alterações de arquivo. `AskUserQuestion` pode ser respondida na interface. Há suporte a mais provedores no chat e anexação de contexto de arquivo/janela, além de atalhos, uso/recap de programação, Apple Music, desktop companion e guarda-roupa.
- Integrações Mac têm dados e ações que não devem ser atribuídos ao Windows. Operações disparadas pelo iPhone, como aprovar/mesclar PR, repetir CI e alterar workflow, exigem Face ID.
- O código contém arquivos muito extensos — por exemplo, a view principal da ilha, servidor de hooks, configurações e estado global — o que concentra bastante comportamento em poucos módulos.

### iPhone, widgets e relay

- O app Phone acompanha sessões/serviços, recebe aprovações e perguntas com Face ID, oferece notificações/Live Activities, widgets e atalhos do ecossistema Apple.
- A sincronização pessoal usa CloudKit privado e dados criptografados; o relay APNs envia somente os campos necessários à atividade. A experiência depende do app Mac e de serviços da Apple, portanto não constitui uma lacuna de paridade Windows.

## Comparação atual com o Edge Ghosty

### Pontos em que o Edge já cobre ou diferencia bem

- Ghosty é específico do produto, com identidade e animações próprias; não precisa imitar a personagem Mochi.
- Controles nativos de volume e reprodução de mídia, foco, lançador/atalhos, prancheta e Bolso são utilidades centrais da proposta Edge.
- A geometria de borda/monitor atende um menu de tela lateral e não só um notch horizontal central.
- O fluxo de presença e aprovações do Codex, além do chat rápido conectado pelo OAuth/app-server, são diferentes do chat do Coucou baseado em API Claude. Um não é simples substituto do outro.
- O estado local atual inclui painel GitHub com detalhes de PR/revisão/CI, bandeja com pausa, tons, métricas locais e envio explícito de item do Bolso ao chat. Isso fecha várias diferenças citadas no relatório comparativo anterior.

### Lacunas reais ou oportunidades

1. **Revisão e recuperação da instalação de hooks.** O instalador do Coucou oferece uma revisão concreta do diff, backup datado e checagem contra edição concorrente. O instalador do Ghosty preserva hooks alheios, mas não apresenta a mesma revisão/backup. Esse é o aprendizado mais direto, pois altera uma configuração global do usuário.
2. **Atividade de Codex em uma linha do tempo curta.** O Coucou mostra ações/ferramentas durante a sessão. O Ghosty prioriza estados e contagens e deliberadamente não guarda prompts, respostas ou saídas. Um ticker limitado a nome/tipo da ferramenta, duração e conclusão pode ser útil, mas deve ser uma escolha de privacidade explícita; não copiar o histórico de conteúdo.
3. **Mais cards de serviços.** O Coucou Windows integra Vercel, Stripe, n8n, Resend, Notion e Cal.com além de GitHub. Para Ghosty, Vercel ou n8n seriam candidatos mais alinhados a desenvolvimento do que replicar todos os sete. Cada integração exige credenciais, política de rede, frequência de atualização e ação de desconectar/limpar.
4. **Proteção de anexos grandes.** No fluxo de arquivo do Coucou, o texto tem limite, mas os binários codificados em base64 não têm limite de tamanho visível no ponto de leitura analisado. Um limite e uma confirmação de destino/custo seriam boas salvaguardas se o Ghosty ampliar anexos.
5. **Coerência de pausa nas integrações do Coucou.** As tarefas periódicas respeitam `PAUSED`, mas o comando de atualização manual (`poll_once`) despacha o poller sem verificar essa flag, apesar do comentário dizer que em pausa não há chamadas de rede. É uma discrepância verificável a corrigir no próprio Coucou; não é um padrão a copiar.

## Qualidade de implementação e riscos

### Acertos técnicos

- O caminho de hooks foi desenhado com atenção a falhas: valida sessão/pedido, vincula a decisão ao pedido ativo, limita payload e tempo de espera, e deixa o terminal reassumir se a UI estiver pausada ou indisponível.
- Credenciais de APIs ficam no armazenamento do sistema; o aplicativo declara ausência de telemetria e limita o tráfego às integrações configuradas.
- O preview/fingerprint/backup antes de editar hooks é um padrão particularmente bom para configurações globais.
- A separação entre implementações nativas e Tauri permite adaptar interações a cada sistema, mas aumenta o custo de manter paridade.

### Pontos de atenção

- Há divergência entre documentação e comportamento Windows: textos de configurações sugerem responder perguntas no painel, enquanto `buildQuestion` avisa que a resposta ainda deve ser feita no terminal.
- A página de privacidade usa a formulação ampla de que Coucou “só lê” as integrações, mas a seção do iPhone descreve ações autenticadas como mesclar PR, repetir CI e alterar workflows. Deve ficar explícito em qual plataforma cada verbo vale.
- As documentações de agentes não são totalmente consistentes entre si sobre quais agentes recebem cartão de aprovação. Verificar o código específico por plataforma antes de usar a tabela geral.
- `additionalBrowserArgs` passa flags privadas/de navegador ao WebView2, inclusive desabilitando `msSmartScreenProtection`. Isso merece uma justificativa de produto e revisão de privacidade/segurança. A documentação Microsoft trata browser flags como recurso de desenvolvimento/diagnóstico e desaconselha seu uso em produção; não copiar essa configuração sem verificar uma API suportada ou remover flags desnecessárias.
- A ação de atualizar manualmente um card de integração pode ultrapassar a pausa global, conforme descrito acima.
- A camada Windows tem testes auxiliares de lógica, mas o workflow de Windows observado foca em empacotamento; não encontrei a mesma execução de cobertura de testes presente nos fluxos Mac/Linux. A auditoria não executou nenhum teste.
- O README raiz representa o produto multiplataforma e pode induzir a atribuir recursos do Mac/iPhone ao Windows. A distribuição Windows também tem documentação de indisponibilidade temporária do instalador, enquanto o workflow contém lógica de publicação; o estado precisa ser mantido alinhado.
- Views e serviços extensos, somados à duplicação de comportamentos entre Swift e Tauri, aumentam risco de drift funcional e custo de manutenção.

## Design, ativos e licença

O que vale aproveitar do Coucou é o vocabulário visual: superfícies escuras, hierarquia tipográfica, composição de cards, estados nítidos, microanimações e integração visual do personagem com a atividade. Para Ghosty, isso precisa ser traduzido à topologia lateral da ilha, que tem outro espaço útil e outro comportamento de entrada. O painel mais largo do Ghosty pode usar melhor a área horizontal sem copiar a silhueta do produto Mac.

O código é MIT, mas `LICENSE-ASSETS.md` reserva marca, nomes, arte/personagem, ícones, sons e mídia do Coucou/Mochi. Usar o Coucou como referência de interação/layout não autoriza incorporar esses arquivos. O Ghosty já tem uma direção visual deliberadamente distinta e deve preservá-la.

## Prioridades sugeridas para o Edge Ghosty

1. Adotar preview/diff, backup com data e checagem de concorrência no fluxo que instala/remove hooks do Codex.
2. Decidir se o painel precisa de ticker de atividade de sessão; se sim, limitar campos e retenção e deixar claro que conteúdo de prompts/respostas não será persistido.
3. Se o usuário quiser cards de serviços, priorizar uma integração de desenvolvimento de cada vez (por exemplo, Vercel), com credenciais no armazenamento seguro e pausa de rede efetiva.
4. Colocar limites de tamanho e feedback claro em anexos ao chat.
5. Manter teste de capacidades por plataforma e documentação Windows como fonte de verdade para evitar prometer recursos que só existem no Mac/iPhone.
6. Continuar usando a linguagem de layout do Coucou como referência, mantendo a silhueta lateral, o Ghosty e seus ativos originais.

## Arquivos tocados

- Criado somente este snapshot de contexto.
- Nenhum código, configuração, recurso ou `AGENTS.md` do produto foi alterado nesta tarefa. Alterações preexistentes no workspace foram preservadas.

## Validação e limitações

- Confirmado que o clone estava no commit indicado e sem mudanças locais.
- Feita inspeção estática das áreas e documentos acima; não foram executados build, testes ou app em runtime, porque o pedido foi análise do repositório.
- O inventário cobriu os binários, mas capturas, sprites, vídeos e sons não foram todos inspecionados visualmente/auditivamente.
- Os resultados descrevem o commit de 2026-10-06 comparado ao workspace Edge Ghosty em 2026-10-07; commits posteriores podem mudar os achados.

## Próximos passos

- Se for implementar uma diferença, começar pelo fluxo de revisão/backup dos hooks, pois combina segurança, reversibilidade e baixa expansão de escopo.
- Antes de adicionar ticker ou outro serviço, definir os dados armazenados, retenção, comportamento de pausa e controles de desconexão.
