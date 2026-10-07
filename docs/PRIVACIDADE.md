# Privacidade e dados locais do Edge Ghosty

Esta página descreve o comportamento atual da versão Windows. O Edge Ghosty não envia telemetria de uso ao desenvolvedor.

## Dados que ficam neste dispositivo

- Preferências, atalhos, tema e acessórios do Ghosty, equipe selecionada da Vercel, itens do Bolso e texto que você escolhe guardar ficam no armazenamento local do WebView.
- O Bolso guarda caminhos de arquivos; não move nem apaga os originais. Texto guardado é mantido localmente até você removê-lo.
- O resumo do Codex mantém somente contagens de sessões, tarefas, etapas, aprovações e duração estimada. O histórico é local e eventos com mais de 90 dias são removidos quando o resumo é atualizado.
- O ticker do Codex mantém em memória no máximo 12 eventos recentes: tipo de etapa, nome da ferramenta ou subagente e horário. Ele some ao fechar o aplicativo. Não inclui prompt, resposta, comando, resultado de ferramenta nem identificador da sessão.
- O helper usa uma fila temporária local com tipo de evento, horário, nome/tipo da ferramenta ou subagente e identificador da sessão para correlacionar etapas. O Ghosty apaga cada arquivo de evento ao consumi-lo; o identificador não passa para o ticker nem para o resumo persistido.
- Durante um pedido explícito de aprovação, a fila também mantém um identificador de decisão e uma descrição curta da ação para mostrar o pedido. Essa descrição é apagada quando o evento é consumido, resolvido, cancelado ou expira; não entra no ticker nem no resumo de 7 dias.
- O rascunho do chat fica local enquanto o usuário trabalha no popup. A transcrição local é encerrada/limpa ao fechar ou reiniciar a conversa, conforme o fluxo do chat.

## Conexões opcionais

### GitHub

O usuário cola um token pessoal. O Ghosty valida o token e guarda o segredo no Gerenciador de Credenciais do Windows. Consulta PRs do usuário, revisões pedidas e verificações de CI pela API do GitHub; não cria, edita, aprova nem mescla PRs. Os resultados carregados ficam em memória durante a execução.

### Vercel

O usuário cola um token e pode informar um ID de equipe. O token fica no Gerenciador de Credenciais do Windows; o ID da equipe, que não é segredo, fica nas preferências locais. O Ghosty valida a conta e consulta os cinco deploys mais recentes pela API da Vercel; não inicia, cancela ou altera deploys. Os resultados ficam em memória durante a execução.

### Chat rápido e arquivos do Bolso

As mensagens enviadas no chat são encaminhadas pelo app-server local ao serviço Codex/OpenAI autenticado pela conta do usuário e ficam sujeitas às políticas desse serviço. O Ghosty encerra a conversa local ao fechar o popup ou iniciar outra conversa; isso não controla a retenção do provedor.

Ao escolher **Perguntar ao Ghosty** para um texto do Bolso, o prompt inclui no máximo os primeiros 6.000 caracteres. O Bolso guarda no máximo 50.000 caracteres desse texto. Para um arquivo, o prompt inclui nome, caminho e tamanho medido localmente; o app não lê, copia nem anexa os bytes automaticamente. Arquivos acima de 25 MiB recebem um aviso para preferir uma cópia menor ou um trecho. Esse valor é uma recomendação de uso, não uma barreira: se o usuário aprovar separadamente um pedido de leitura do Codex, o conteúdo acessado poderá ser processado pelo serviço Codex/OpenAI.

GitHub e Vercel atualizam ao conectar, a cada cinco minutos e quando o usuário pede uma atualização. A opção **Pausar atualizações** na bandeja bloqueia consultas automáticas e manuais e também impede validar novos tokens até retomar. Desconectar remove o token salvo e limpa o cache da integração.

## Hooks locais do Codex

Conectar o Codex altera o arquivo `hooks.json` do usuário. Antes de gravar, o Ghosty mostra as entradas próprias que serão adicionadas, atualizadas ou removidas. A confirmação é explícita; antes de uma alteração existente, é criado um backup datado. Se o arquivo mudar depois da prévia, a gravação é cancelada e a revisão precisa ser refeita. Entradas de outros hooks são preservadas.

O helper local observa nomes/tipos de eventos e ferramentas para mostrar presença. `PermissionRequest` também pode manter uma descrição curta da ação enquanto aguarda a escolha explícita do usuário no Ghosty. O Codex continua controlando seus prompts, respostas e resultados; o Ghosty não os grava nos eventos de presença.

## Serviços externos usados

- GitHub: `api.github.com`, somente para as consultas acima.
- Vercel: `api.vercel.com`, somente para identificar a conta e consultar deploys.
- ChatGPT/Codex: OAuth, mensagens e operações explicitamente autorizadas pelo usuário no chat rápido.
- O navegador abre URLs que o usuário escolhe ou que o chat retorna de acordo com as ações autorizadas.

O Ghosty não configura flags privadas de navegador no WebView2. O app mantém seu conteúdo local no WebView e não adiciona um serviço próprio de analytics.
