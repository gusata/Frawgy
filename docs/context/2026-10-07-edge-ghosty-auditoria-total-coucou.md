# Auditoria comparativa: Coucou e Edge Ghosty

Data: 2026-10-07  
Identificador: edge-ghosty-auditoria-total-coucou

## Objetivo

Inventariar as áreas relevantes do repositório Coucou e comparar os recursos com o Edge Ghosty atual, separando o que existe no build Windows do que pertence somente às versões macOS/iPhone.

## Escopo e fontes

- Repositório Coucou clonado em leitura no commit `20e1f8b9def2b0d29f7c074eace1f7af9ce124bb` (2026-10-06; 382 caminhos rastreados).
- Revisados README principal e Windows, `docs/SPEC.md`, `docs/INTEGRATIONS.md`, `docs/AGENTS.md`, `docs/IPHONE.md`, changelog e as áreas de implementação Windows (hooks, relay, chat, arquivos, integrações, bandeja, configurações, ilha, Mochi, views e upload).
- Inventariado também o código macOS/iPhone e o relay Cloudflare para separar funcionalidades multiplataforma e exclusivas.
- Conferidos os arquivos, a memória `AGENTS.md` e as mudanças locais do Edge Ghosty no workspace. O estado inclui as alterações ainda não commitadas do assistente inicial e do resumo semanal de Foco.

## Inventário do Coucou

### Build Windows

- Ilha escura no topo central, com modos compacto/aberto, animação, click-through, seleção entre monitor principal e monitor sob o cursor e fechamento automático.
- Ícone na bandeja do sistema com Abrir, Configurações, Pausar e Sair; inicialização com Windows configurável.
- Mochi em Canvas 2D, saudações, gestos, reações, estados de trabalho/aprovação/erro/conclusão, miniaturas por agente e efeitos sonoros. O diretório Windows não contém o guarda-roupa encontrado no app Mac.
- Hooks para acompanhar sessões. Claude Code tem instalação guiada, pedido Allow/Deny, ticker de ferramentas e resumo de conclusão. A instalação mostra o diff, cria backup datado, preserva hooks alheios e só escreve após confirmação.
- O relay genérico `coucou-hook.exe --agent <nome>` permite representar outras ferramentas como pills quando seus hooks são configurados. O README Windows lista Gemini CLI, Antigravity, Cursor, Codex, Copilot CLI, Muse Code e agentes personalizados; OpenCode e Amp não funcionam no Windows/Linux.
- Limitações verificadas no código Windows: pedidos de permissão de agente externo voltam ao terminal; pergunta de Claude aparece como aviso, mas precisa ser respondida no terminal; a tela de aprovação tem Allow/Deny, sem Always; não encontrei ticker de diff de arquivos no frontend Windows.
- Chat com Claude via API Anthropic e chave no Windows Credential Manager; modelos Claude selecionáveis, pesquisa web e fluxo de soltar arquivo para perguntar sobre PDF, imagem ou texto. O arquivo é copiado para a caixa local do Coucou e cópias antigas são removidas após uma semana.
- Sete integrações por API: Stripe, GitHub, Vercel, n8n, Resend, Notion e Cal.com. Exibem estado/listas relevantes e mudanças; as credenciais ficam no Credential Manager, e Pausar interrompe a consulta de rede.
- Ao terminar, “Open terminal” abre a pasta de trabalho no VS Code quando disponível. O build Windows não pula para uma janela de terminal específica, não envia arquivo por email e não anexa uma janela como contexto.
- Privacidade descrita pelo projeto: sem telemetria; chamadas de rede apenas para serviços configurados.

### Recursos do repositório que não devem ser atribuídos ao Windows

- O app Mac tem chat também com Gemini, OpenAI, Ollama e LM Studio; gauge do plano Claude; captura de diff completo; respostas interativas a `AskUserQuestion`; salto à janela exata do terminal; Apple Music; acompanhante Mochi solto na área de trabalho; anexar janela ao chat; guarda-roupa com roupas sazonais; atalhos globais configuráveis; resumo semanal de atividade de programação; e dez idiomas.
- O app iPhone acompanha sessões e serviços, permite decisões com Face ID, ações em notificações e Live Activities/Dynamic Island, sincroniza dados criptografados via CloudKit privado, oferece widgets, Control Center, Siri, Shortcuts, Spotlight e filtros de Foco. Ele depende do app Mac e não é uma função do build Windows.
- A versão principal documentada é 0.2.0; o build Windows está separado e documentado como 0.1.1. O README informa que o instalador Windows está temporariamente indisponível, então o repositório pode ser compilado, mas a distribuição Windows anunciada não está equivalente à Mac.

## Estado comparativo do Edge Ghosty

### Já temos ou fazemos melhor para o escopo Windows

- Integração com Codex para presença e aprovações de sessão; chat rápido por Codex app-server com login OAuth, catálogo de modelos, pesquisa/resolução de sites e pedidos explícitos de permissão para ações.
- Volume do Windows e controles de mídia do sistema, mais lançador e atalhos personalizados.
- Foco com temporizador e, nas alterações locais atuais, resumo dos últimos sete dias; preferências locais.
- Bolso local para arquivos/textos sem mover ou apagar originais, e prancheta com itens guardados.
- Personalização de nome, três aparências e acessórios; motor Canvas 2D e animações próprias do Ghosty.
- Ilha em borda esquerda, superior ou inferior, com seleção de vários monitores/todos os monitores.
- Assistente de primeira configuração, seleção de até três atalhos da Home e opção de iniciar com o Windows, nas mudanças locais atuais.

### Recursos do Coucou Windows que não localizei no Edge Ghosty

1. **Integrações de serviços por API**: GitHub com PRs/revisões/CI, além de Vercel, Stripe, n8n, Resend, Notion e Cal.com. Hoje o Edge tem atalhos que abrem destinos, mas não um painel que lê esses estados.
2. **Vários agentes de programação**: a integração de sessão do Edge é específica do Codex; Coucou oferece um relay extensível para hooks e configuração documentada de diversas ferramentas. No Windows do Coucou, agentes externos são monitorados de forma básica; as aprovações deles não são atendidas pelo painel.
3. **Chat ligado a arquivos soltos**: Coucou copia um arquivo para seu inbox e permite perguntar sobre seu conteúdo no chat. O Bolso do Edge guarda referências, mas ainda não oferece uma ação explícita para anexar o item ao chat.
4. **Bandeja do sistema com pausar/retomar**: Coucou expõe comandos de ciclo de vida e pausa real das consultas de integrações. Não encontrei menu equivalente no Edge.
5. **Sons de interação**: o Mochi toca uma biblioteca de efeitos com controle de volume; o Ghosty não tem áudio de interação.
6. **Instalador de hooks com revisão**: o fluxo Claude do Coucou mostra diff e backup datado antes de alterar a configuração. O Edge preserva entradas existentes do Codex, mas seu instalador atual não mostra uma revisão equivalente nem cria backup datado.
7. **Atividade do agente visível**: Coucou Windows tem ticker de ações e cards por serviço. O chat do Edge já pode mostrar a prévia de uma alteração de arquivo pendente de aprovação; os hooks de presença, porém, não mantêm um ticker geral de ferramentas ou diffs e evitam guardar prompts, respostas e resultados. Ampliar o histórico exigiria uma escolha explícita de privacidade e escopo.

### Diferenças parciais ou não aplicáveis

- O resumo semanal de programação do Coucou é Mac-only e registra tempo de coding, sessões, arquivos, linhas, comandos e permissões. O resumo recém-adicionado ao Edge é de tempo em Foco, não de atividade do Codex; ele cobre uma necessidade diferente e já evita reconstruir conteúdo de prompts.
- O Coucou copia os arquivos soltos e apaga as cópias antigas; o Bolso do Edge preserva os originais no lugar. Os fluxos não são equivalentes e não devemos copiar a semântica de upload sem um processamento real.
- O chat do Coucou Windows usa Claude com chave de API e contexto de arquivo. O Edge usa Codex com OAuth e pode solicitar autorização para operações. Um é chat de pesquisa/análise; o outro é uma sessão de agente. Adicionar suporte a arquivo/provedores ao Edge precisa respeitar a autorização explícita já existente.
- O Coucou tem várias funções de macOS/iPhone ausentes no Windows dele. São referências de expansão de produto, não lacunas de paridade para o Edge Windows.
- A apresentação de personagem do Edge é deliberadamente diferente. O que falta de Mochi — principalmente roupas sazonais e biblioteca de sons — é polimento opcional, não motivo para copiar sua identidade visual.

## Prioridades sugeridas

1. Começar por **GitHub**: PRs aguardando revisão, estado de CI e atalhos para abrir o detalhe; ampliar para Vercel/n8n depois se fizer sentido.
2. Adicionar **anexar um item do Bolso ao chat por ação explícita**, começando com texto e arquivos compatíveis, sem alterar o arquivo original.
3. Expandir **presença multiagente por hooks** além do Codex, iniciando com uma ferramenta que o usuário realmente usa e definindo quais eventos e permissões são confiáveis.
4. Colocar **ícone na bandeja** para abrir, configurações, pausar a integração e sair, especialmente se o Edge passar a consultar serviços.
5. Agregar **métricas locais de sessões do Codex** ao resumo de Foco, sem salvar prompt/resposta/comandos; oferecer limpeza do histórico.
6. Adicionar sons opcionais e, se desejado, mais variações de aparência do Ghosty. Não copiar o personagem Mochi.

## Alterações realizadas

- Nenhum código, configuração ou recurso do produto foi alterado nesta tarefa.
- Criado somente este snapshot em `docs/context/`.

## Validações

- Revisão estática do clone Coucou e do workspace atual do Edge Ghosty, com consultas ao README, documentação e arquivos de implementação.
- Não foram executados builds ou testes, pois a tarefa solicitou análise comparativa, não validação de implementação.

## Problemas conhecidos e próximos passos

- A implementação Windows do Coucou e seus metadados de versão são diferentes da lista ampla do README raiz. Comparações futuras devem continuar verificando o código Windows antes de contar uma função como disponível no Windows.
- Este relatório compara o commit indicado acima com o workspace Edge Ghosty em 2026-10-07; commits posteriores podem alterar os recursos.
- Próximo passo: escolher uma prioridade e definir o fluxo/escopo antes de implementar.
