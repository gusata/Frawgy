# Edge Mochi

Um painel rápido para Windows, inspirado na ilha do Coucou. O Edge Mochi fica preso à borda da tela, abre com hover e reúne controles e pequenos recursos do dia a dia.

## O que tem no painel

- Volume do sistema e controles da faixa de mídia atual.
- Temporizador de foco com duração configurável e pausa.
- Lançador para aplicativos, pastas, endereços e pesquisas na web.
- Ações personalizadas que podem abrir vários destinos.
- Prancheta de texto: capture, fixe, copie de volta ou remova entradas.
- Bolso do Mochi: solte arquivos, imagens ou texto para guardá-los e abrir depois. O arquivo original não é movido nem apagado; o app guarda o caminho.
- Pet personalizável com nome, aparência e acessório. O painel de vidro muda de cor suavemente conforme o humor e o item guardado.
- Abas Home, Pet e Atalhos em três botões compactos no cabeçalho.

As preferências, atalhos, histórico de texto e itens do Bolso ficam no armazenamento local do WebView. A leitura da prancheta acontece quando você escolhe capturar; o app não coleta cada cópia em segundo plano.

## Desenvolvimento

Requisitos: Node 20+, Rust e WebView2.

```powershell
npm install
npm run dev
```

Para abrir como app Tauri:

```powershell
npm run tauri dev
```

A interface usa uma janela transparente, uma ilha escura com duas “orelhas” feitas com `radial-gradient` e comandos Win32 para volume, prancheta, mídia e abertura de destinos.
