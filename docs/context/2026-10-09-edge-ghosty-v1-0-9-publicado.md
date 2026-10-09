# Contexto: release v1.0.9 publicada

- Data: 2026-10-09
- Objetivo: registrar a publicação Windows do Edge Ghosty v1.0.9.
- Alterações incluídas no release: saudação animada de primeira execução inspirada na coreografia do Coucou usando o renderer do Ghosty; encaixe acompanhado do personagem e revelação do onboarding; replay pelas configurações; suporte à borda direita; metadados do app alinhados em `1.0.9`.
- Commit/tag do release: `e5f03ad` / `v1.0.9`.
- Arquivos de release: instalador `Edge.Ghosty_1.0.9_x64-setup.exe`, assinatura `.sig` e `latest.json`.
- Validações: `scripts/check-release-version.mjs` confirmou os manifestos; GitHub Actions `37989850963` concluiu com sucesso em 8m06s; `latest.json` foi conferido com versão `1.0.9`, URL do instalador e assinatura; release publicada em https://github.com/gusata/Ghosty/releases/tag/v1.0.9.
- Problemas conhecidos: a animação inicial ainda precisa de confirmação visual numa instalação limpa do Windows.
- Próximos passos: instalar a versão publicada e validar a primeira execução e o botão de replay.
