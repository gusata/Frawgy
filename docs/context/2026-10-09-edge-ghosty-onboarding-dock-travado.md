# Contexto: corrigir a entrada do onboarding travada

- Data: 2026-10-09
- Objetivo: corrigir a tela de boas-vindas que ficava preta depois da introdução, com o Ghosty parado no centro e as opções ocultas.
- Alterações: a etapa de encaixe do Ghosty agora espera a animação da geometria por no máximo 1,1 s; depois calcula o destino e continua revelando o conteúdo, mesmo se a mola não reportar repouso subpixel.
- Arquivos tocados: `src/main.ts`; este snapshot em `docs/context/`.
- Validações: revisão estática do fluxo de conclusão e encaixe; `git diff --check`.
- Problemas conhecidos: a validação visual no WebView ainda depende de reproduzir a introdução no app.
- Próximos passos: abrir/reproduzir a introdução e confirmar que Ghosty se move para o cartão e as opções aparecem.
