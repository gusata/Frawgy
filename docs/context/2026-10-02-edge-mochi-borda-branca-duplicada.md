# Correção da borda branca duplicada no painel do pet

- **Objetivo:** fazer a borda translúcida do painel do Mochi aparecer sem o contorno branco forte por cima.
- **Alterações:** removida a borda branca herdada (`2px solid white`) da regra antiga `.pet-page`; o aro genérico de `.tab-view` fica transparente somente quando contém `.pet-page`. A borda desejada continua em `.pet-page::before` com `#ffffff12`.
- **Arquivos tocados:** `src/style.css`.
- **Validações:** conferência estática das regras CSS; sem build ou teste visual.
- **Problemas conhecidos:** a aparência final depende da atualização/reabertura do app e ainda precisa ser conferida visualmente.
- **Próximos passos:** conferir a aba do Mochi; ajustar o alfa de `#ffffff12` se a linha ainda estiver forte ou fraca.
