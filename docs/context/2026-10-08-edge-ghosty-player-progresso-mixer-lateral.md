# Contexto: player com progresso e mixer lateral

Data: 2026-10-08  
Identificador: edge-ghosty-player-progresso-mixer-lateral

## Objetivo

Melhorar a tela Mídia com capa, progresso da faixa, busca e atualização automática. Acrescentar controle de volume por aplicativo em um painel lateral que amplia a ilha com animação.

## Alterações realizadas

- A sessão de mídia do Windows agora retorna título, artista, identificador da faixa, capa, posição, duração e suporte a busca.
- A tela Mídia exibe capa e progresso, interpola a posição entre consultas e permite buscar quando o player informa que aceita essa ação.
- A capa é consultada novamente quando muda a faixa; a Home/Mídia atualiza os dados periodicamente enquanto está expandida.
- O botão “Volume dos apps” abre um painel lateral com sliders para sessões de áudio por aplicativo no dispositivo de saída padrão.
- A ilha amplia a largura ao abrir o mixer: até 1060×250 logical px nas bordas horizontais e 860×480 na esquerda. `expandedIslandSize()` alimenta `animateIsland`, que continua publicando o hitbox nativo durante cada quadro.
- O slider de volume geral permanece disponível e independente do mixer.
- Atualizada a memória geral do projeto com a geometria e o comportamento do player/mixer.

## Arquivos tocados

- `AGENTS.md`
- `src/main.ts`
- `src/style.css`
- `src-tauri/Cargo.toml`
- `src-tauri/src/lib.rs`
- Este snapshot em `docs/context/`

## Validações

- Revisão estática dos trechos alterados e das assinaturas Windows usadas.
- Build, testes e inspeção no runtime Windows não foram executados nesta tarefa.

## Problemas conhecidos

- Capa, duração e busca dependem dos dados e controles expostos pelo aplicativo de mídia ativo.
- O mixer lista sessões Core Audio do dispositivo de saída padrão; nomes vêm do executável do processo, com alguns nomes comuns ajustados para leitura.
- A atualização periódica e a animação lateral ainda precisam de conferência visual no runtime, especialmente na borda esquerda e em monitores menores.

## Próximos passos

- Compilar Rust no Developer PowerShell do Visual Studio e conferir a Home/Mídia no Windows.
- Testar faixa com capa/busca disponível e faixa em que o player não permite busca.
- Abrir/fechar o mixer nas três bordas, ajustar volume de mais de um aplicativo e confirmar que o hitbox acompanha a expansão.
