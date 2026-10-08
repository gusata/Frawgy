# Snapshot: atualizador assinado pelo GitHub Releases

## Objetivo

Permitir que instalações do Edge Ghosty verifiquem atualizações publicadas no GitHub e instalem novos bundles NSIS assinados pelo próprio app.

## Alterações realizadas

- Adicionados os plugins Rust e JavaScript do Tauri Updater e Process; o backend registra ambos e o frontend reinicia o app após instalar.
- Configurados artefatos assinados, endpoint `latest.json` do repositório `gusata/Ghosty` e modo de instalação passivo do NSIS.
- A janela principal verifica atualizações no início e a cada seis horas. Configurações permite consultar manualmente, mostra uma marca no botão quando há versão nova, exibe progresso e inicia a instalação sob ação explícita.
- O workflow de release recebe a chave privada pelo segredo Actions `TAURI_SIGNING_PRIVATE_KEY`; a chave nunca é gravada no repositório.
- Gerado um par minisign local fora da pasta do projeto. A chave pública foi configurada em `src-tauri/tauri.conf.json`; o arquivo privado permanece no perfil do usuário.
- Atualizada a memória geral para registrar o fluxo e a exigência de bootstrap manual para as instalações anteriores ao updater.

## Arquivos tocados

- `.github/workflows/release-windows.yml`
- `AGENTS.md`
- `package.json`
- `package-lock.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/gen/schemas/acl-manifests.json`
- `src-tauri/gen/schemas/capabilities.json`
- `src-tauri/gen/schemas/desktop-schema.json`
- `src-tauri/gen/schemas/windows-schema.json`
- `src-tauri/src/lib.rs`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/updater-main.json`
- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-08-edge-ghosty-updater-tauri-github.md`

## Validações

- `npm install` adicionou os plugins updater e process; auditoria reportou zero vulnerabilidades.
- `cargo metadata` resolveu os plugins e suas dependências sem compilar o app.
- A chave pública gerada foi comparada com a configuração Tauri; a chave privada não foi exibida nem adicionada ao repositório.
- Build e testes não foram executados.

## Problemas conhecidos

- O segredo `TAURI_SIGNING_PRIVATE_KEY` ainda precisa ser cadastrado no repositório GitHub antes de acionar o workflow de release.
- A tag `v1.0.3` ainda não foi criada. Instalações anteriores à primeira versão com updater precisam instalar essa versão manualmente uma vez.
- O app precisa ser aberto no Windows para conferir o ciclo completo de busca, download, instalação e reinício.

## Próximos passos

- Copiar o conteúdo do arquivo privado local para `Settings → Secrets and variables → Actions` no GitHub, com o nome `TAURI_SIGNING_PRIVATE_KEY`.
- Commitar as mudanças, enviar a tag `v1.0.3`, revisar o rascunho do Release e publicá-lo para entregar o bootstrap manual.
- Depois, testar uma versão posterior pelo cartão Atualizações nas Configurações.
