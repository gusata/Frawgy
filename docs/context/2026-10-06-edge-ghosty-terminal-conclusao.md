# Edge Ghosty: atividade do terminal e conclusão de tarefa

## Objetivo

Atualizar a marca para Edge Ghosty e fazer a barrinha indicar atividade de tarefas do Codex. Ao fim de um turno, Ghosty deve saltar para fora da barra, avisar que a tarefa terminou e voltar para dentro.

## Alterações realizadas

- As três bolinhas pulsam em sequência enquanto uma tarefa do Codex está ativa.
- No evento `Stop`, Ghosty recebe o estado `finished`, salta para fora da ilha com um aviso de conclusão e retorna à barra após 3,5 segundos.
- A animação acompanha as bordas esquerda, superior e inferior, respeitando `prefers-reduced-motion`.
- A marca em uso foi trocada para Edge Ghosty na interface, documentação corrente, metadados do projeto e títulos Tauri.
- Preferências salvas com as chaves antigas são copiadas para chaves novas; o nome padrão anterior vira Ghosty. O identificador Tauri foi mantido para preservar o diretório local existente.
- O hook novo usa o nome Ghosty e reconhece os handlers antigos para permitir que sejam removidos sem tocar nos hooks de terceiros.
- Corrigi erros de tipagem já presentes na geometria publicada, na criação de item da prancheta e nas chamadas de segmento da animação de boas-vindas para que o build TypeScript pudesse concluir.

## Arquivos tocados

- `AGENTS.md`
- `README.md`
- `index.html`
- `package.json`
- `package-lock.json`
- `src/main.ts`
- `src/pet-motion.ts`
- `src/style.css`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/build.rs`
- `src-tauri/capabilities/default.json`
- `src-tauri/gen/schemas/capabilities.json`
- `src-tauri/src/codex-hook.ps1`
- `src-tauri/src/codex_hooks.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/src/main.rs`
- `src-tauri/tauri.conf.json`

## Validações

- `npm run build` passou: TypeScript compilou e o Vite gerou os assets de produção.
- Não executei testes nem compilação Rust.

## Problemas conhecidos

- A indicação usa eventos do hook local do Codex. Terminais sem essa integração não informam ao Ghosty quando uma tarefa começa ou termina.
- A animação e o comportamento de `prefers-reduced-motion` ainda precisam de inspeção visual no runtime Windows.
- A compilação Rust da troca do nome do crate ainda precisa ser feita no Developer PowerShell do Visual Studio.
- O identificador Tauri e os nomes antigos usados só na migração permanecem por compatibilidade com preferências e dados instalados.

## Próximos passos

- Ativar a integração do Codex, executar uma tarefa e conferir o pulso das bolinhas e o salto ao receber `Stop`.
- Conferir o posicionamento nas bordas esquerda, superior e inferior, além de testar tarefas encerradas por interrupção.
- Compilar o backend Rust no Developer PowerShell do Visual Studio.
