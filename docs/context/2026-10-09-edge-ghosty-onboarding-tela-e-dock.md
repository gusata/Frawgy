# Contexto da tarefa: tela inicial e encaixe do Ghosty

## Objetivo

Refinar a tela de boas-vindas do onboarding para combinar com os cartões escuros do app, evitar rolagem desnecessária e dar continuidade visual à animação de entrada.

## Alterações realizadas

- A tela de boas-vindas ficou mais compacta: personagem em um cartão discreto, texto com hierarquia mais clara, três benefícios em cartões menores e ações com tamanhos equilibrados.
- Foram removidos os enfeites repetitivos de órbita, partículas e balão da tela estática; as partículas da animação de entrada permanecem.
- O indicador de etapa passou a usar pílula e progresso em duas partes; a página de configuração rápida recebeu o mesmo tratamento.
- Ao concluir a animação, o painel expande até o tamanho do onboarding, o Ghosty se desloca até o centro do espaço reservado no canto superior esquerdo e só então aparecem texto, benefícios e botões em sequência.
- A posição final do Ghosty é calculada pela geometria real da tela após a expansão. Movimento reduzido continua pulando a coreografia de entrada.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-09-edge-ghosty-onboarding-tela-e-dock.md` (este snapshot)

## Validação

- Revisão estática do ciclo da animação, das condições de renderização e dos estados de movimento reduzido.
- `git diff --check` executado.
- Nenhum teste ou build foi executado.

## Problemas conhecidos

- A nova composição e o deslocamento ainda precisam de conferência visual no runtime Tauri em tela horizontal e com pouco espaço vertical.

## Próximos passos

- Reproduzir a introdução pelo botão de teste e conferir a expansão, o encaixe do Ghosty e a entrada sequenciada das opções.
