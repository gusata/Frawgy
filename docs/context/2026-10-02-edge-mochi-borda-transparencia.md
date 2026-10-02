# Ajuste de transparência da borda do painel

- **Objetivo:** reduzir o destaque branco da borda translúcida do painel interno do Mochi.
- **Alterações:** em `.pet-page::before`, a cor da borda mudou de `#ffffff24` para `#ffffff12` (menor opacidade). O restante do painel e as animações não foram alterados.
- **Arquivos tocados:** `src/style.css`.
- **Validações:** conferência estática da regra CSS; sem build ou teste visual.
- **Problemas conhecidos:** a aparência final precisa ser conferida no app.
- **Próximos passos:** se ainda estiver forte, baixar o último par hexadecimal (`12`) para `0c` ou `08`; para aumentar, usar um valor maior.
