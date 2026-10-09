# Contexto: preparar release v1.0.9

- Data: 2026-10-09
- Objetivo: consolidar e publicar as alterações recentes do Edge Ghosty como release Windows `v1.0.9`.
- Alterações: alinhamento de `package.json`, `package-lock.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock` e `src-tauri/tauri.conf.json` em `1.0.9`; inclusão das alterações pendentes da introdução e do onboarding, suporte à borda direita, botão de replay, avisos MIT e documentos de contexto/design.
- Arquivos tocados: metadados de versão, alterações pendentes do produto, `THIRD_PARTY_NOTICES.md`, documentação e este snapshot.
- Validações: conferência do workflow `.github/workflows/release-windows.yml`, que valida os metadados e compila instalador NSIS via GitHub Actions; validação de build fica a cargo desse workflow.
- Problemas conhecidos: `gh auth status` informa token inválido e a conexão ao GitHub está bloqueada no sandbox; commit/tag e publicação dependem de recuperar o acesso remoto.
- Próximos passos: executar o workflow pela tag `v1.0.9`, revisar os artefatos do rascunho e publicá-lo.
