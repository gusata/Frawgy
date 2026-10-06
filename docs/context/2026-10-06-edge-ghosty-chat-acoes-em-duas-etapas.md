# Snapshot: executar pedidos compostos em duas etapas

## Objetivo

Iniciar imediatamente uma ação local explícita, como abrir o GitHub, enquanto o chat começa a trabalhar na parte restante do mesmo pedido.

## Alterações

- Detectada uma frase composta que começa com abrir/acessar uma URL, domínio ou alias conhecido e continua após `e`/`e depois`.
- O Ghosty dispara `open_targets` primeiro sem aguardar o navegador, exibe a confirmação da abertura e envia a continuação ao `codex app-server` sem repetir o pedido da primeira parte.
- A mensagem completa continua visível na bolha do usuário; a continuação recebida pelo app-server informa que o site já está abrindo.
- Pedidos simples de abertura permanecem no caminho local e não criam um turno no modelo.

## Arquivos tocados

- `src/main.ts`
- `AGENTS.md`
- Este snapshot.

## Validações

- `npm run build` passou.
- Ainda não houve inspeção manual dessa sequência no popup/browser do Windows.

## Problemas conhecidos e limites

- O restante da solicitação ainda depende da resposta do modelo e das ferramentas que ele usar; a mudança remove o atraso do modelo antes de iniciar a abertura local, mas não elimina o tempo de pesquisa ou execução.
- A abertura local chama o navegador padrão do Windows. O app-server não interage diretamente com a aba aberta; pesquisas continuam ocorrendo pelas ferramentas disponíveis ao modelo.
- O divisor automático só atua quando há uma abertura de site inequívoca no início e `e` seguido da continuação.

## Próximos passos

- No Windows, testar `abrir o GitHub e pesquisar ...`, confirmando que a janela do navegador abre logo e que o modelo recebe apenas a continuação.
