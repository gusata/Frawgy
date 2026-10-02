# Borda arredondada no painel do pet

- **Objetivo:** deixar o componente interno da aba do Mochi com uma borda fina, translúcida e cantos arredondados.
- **Alterações:** o fundo de vidro de `.pet-page::before` agora ocupa a área do painel (`inset: 0`) e tem borda branca com baixa opacidade (`1px solid #ffffff24`) e raio de 24px. O gradiente, o blur e a sombra existentes foram mantidos.
- **Arquivos tocados:** `src/style.css`.
- **Validações:** revisão estática do CSS; não foi executado build nem teste visual.
- **Problemas conhecidos:** o resultado visual ainda precisa ser conferido na janela do app para ajustar a intensidade da borda, se necessário.
- **Próximos passos:** abrir a aba do Mochi e confirmar se a moldura envolve a região desejada.
