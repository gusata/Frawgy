use reqwest::header::{ACCEPT, AUTHORIZATION, USER_AGENT};
use serde::Serialize;
use serde_json::Value;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};

const CREDENTIAL_TARGET: &str = "Edge Ghosty/GitHub";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GithubPullRequest {
    pub title: String,
    pub repository: String,
    pub number: u64,
    pub url: String,
    pub draft: bool,
    pub ci_status: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GithubSnapshot {
    pub login: String,
    pub checked_at: u64,
    pub authored: Vec<GithubPullRequest>,
    pub review_requested: Vec<GithubPullRequest>,
}

#[derive(Default)]
pub struct GithubCache(pub Mutex<Option<GithubSnapshot>>);

fn read_token() -> Result<Option<String>, String> {
    crate::credentials::read(CREDENTIAL_TARGET)
}

fn client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(18))
        .build()
        .map_err(|error| format!("Não consegui preparar a conexão com o GitHub: {error}"))
}

async fn api_get(client: &reqwest::Client, token: &str, url: &str) -> Result<Value, String> {
    let response = client.get(url)
        .header(USER_AGENT, "Edge-Ghosty")
        .header(ACCEPT, "application/vnd.github+json")
        .header(AUTHORIZATION, format!("Bearer {token}"))
        .header("X-GitHub-Api-Version", "2022-11-28")
        .send().await
        .map_err(|error| format!("Conexão com o GitHub falhou: {error}"))?;
    let status = response.status();
    if !status.is_success() {
        return Err(match status.as_u16() {
            401 => "O GitHub recusou o token salvo. Conecte a conta novamente.".to_string(),
            403 | 429 => "O GitHub limitou temporariamente esta consulta. Tente novamente em instantes.".to_string(),
            code => format!("O GitHub respondeu com HTTP {code}.")
        });
    }
    response.json::<Value>().await.map_err(|error| format!("Resposta inválida do GitHub: {error}"))
}

fn required_text(value: &Value, key: &str) -> Result<String, String> {
    value.get(key).and_then(Value::as_str).map(str::to_string)
        .ok_or_else(|| format!("O GitHub não retornou o campo {key}."))
}

fn repository_slug(repository_url: &str) -> Option<String> {
    let slug = repository_url.strip_prefix("https://api.github.com/repos/")?;
    let mut pieces = slug.split('/');
    let owner = pieces.next()?;
    let repo = pieces.next()?;
    if pieces.next().is_some() || owner.is_empty() || repo.is_empty()
        || !owner.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
        || !repo.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == '.') {
        return None;
    }
    Some(format!("{owner}/{repo}"))
}

fn ensure_not_paused(pause: &crate::tray::AppPauseState) -> Result<(), String> {
    if pause.is_paused() {
        Err("As atualizações estão pausadas pela bandeja do sistema.".to_string())
    } else {
        Ok(())
    }
}

async fn search_pull_requests(
    client: &reqwest::Client,
    token: &str,
    qualifier: &str,
    pause: &crate::tray::AppPauseState,
) -> Result<Vec<GithubPullRequest>, String> {
    ensure_not_paused(pause)?;
    let url = reqwest::Url::parse_with_params(
        "https://api.github.com/search/issues",
        &[("q", qualifier), ("per_page", "5"), ("sort", "updated"), ("order", "desc")],
    ).map_err(|error| error.to_string())?;
    let response = api_get(client, token, url.as_str()).await?;
    let items = response.get("items").and_then(Value::as_array).cloned().unwrap_or_default();
    Ok(items.into_iter().filter_map(|item| {
        let repository = repository_slug(item.get("repository_url")?.as_str()?)?;
        Some(GithubPullRequest {
            title: item.get("title")?.as_str()?.chars().take(160).collect(),
            repository,
            number: item.get("number")?.as_u64()?,
            url: item.get("html_url")?.as_str()?.to_string(),
            draft: item.get("draft").and_then(Value::as_bool).unwrap_or(false),
            ci_status: None,
        })
    }).collect())
}

async fn pull_ci_status(
    client: &reqwest::Client,
    token: &str,
    pull: &GithubPullRequest,
    pause: &crate::tray::AppPauseState,
) -> Option<String> {
    if pause.is_paused() { return None; }
    let details_url = format!("https://api.github.com/repos/{}/pulls/{}", pull.repository, pull.number);
    let details = api_get(client, token, &details_url).await.ok()?;
    if pause.is_paused() { return None; }
    let sha = details.get("head")?.get("sha")?.as_str()?;
    let url = format!("https://api.github.com/repos/{}/commits/{sha}/check-runs?per_page=20", pull.repository);
    let checks = api_get(client, token, &url).await.ok()?;
    let checks = checks.get("check_runs")?.as_array()?;
    if checks.is_empty() { return Some("Sem verificações".to_string()); }
    if checks.iter().any(|check| check.get("conclusion").and_then(Value::as_str).is_some_and(|value| matches!(value, "failure" | "timed_out" | "cancelled" | "action_required"))) {
        return Some("Falhou".to_string());
    }
    if checks.iter().all(|check| check.get("status").and_then(Value::as_str) == Some("completed")) {
        Some("Aprovado".to_string())
    } else {
        Some("Em andamento".to_string())
    }
}

async fn fetch_snapshot(token: &str, pause: &crate::tray::AppPauseState) -> Result<GithubSnapshot, String> {
    ensure_not_paused(pause)?;
    let client = client()?;
    let user = api_get(&client, token, "https://api.github.com/user").await?;
    ensure_not_paused(pause)?;
    let login = required_text(&user, "login")?;
    let mut authored = search_pull_requests(&client, token, &format!("is:pr is:open author:{login}"), pause).await?;
    let review_requested = search_pull_requests(&client, token, &format!("is:pr is:open review-requested:{login}"), pause).await?;
    for pull in authored.iter_mut().take(5) {
        ensure_not_paused(pause)?;
        let status = pull_ci_status(&client, token, pull, pause).await;
        pull.ci_status = status;
    }
    Ok(GithubSnapshot {
        login,
        checked_at: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_millis() as u64,
        authored,
        review_requested,
    })
}

#[tauri::command]
pub fn github_token_status() -> Result<bool, String> {
    read_token().map(|token| token.is_some())
}

#[tauri::command]
pub async fn github_save_token(token: String, pause: State<'_, crate::tray::AppPauseState>) -> Result<String, String> {
    if pause.is_paused() {
        return Err("As atualizações estão pausadas. Retome-as pela bandeja para conectar o GitHub.".to_string());
    }
    let token = token.trim();
    if token.is_empty() || token.len() > 2400 || !token.bytes().all(|byte| byte.is_ascii_alphanumeric() || byte == b'_' || byte == b'-') {
        return Err("Cole um token pessoal do GitHub válido.".to_string());
    }
    let client = client()?;
    let user = api_get(&client, token, "https://api.github.com/user").await?;
    let login = required_text(&user, "login")?;
    if pause.is_paused() {
        return Err("As atualizações foram pausadas durante a validação do token.".to_string());
    }
    crate::credentials::write(CREDENTIAL_TARGET, token)?;
    Ok(login)
}

#[tauri::command]
pub fn github_clear_token(app: AppHandle) -> Result<(), String> {
    crate::credentials::delete(CREDENTIAL_TARGET)?;
    let cache = app.state::<GithubCache>();
    *cache.0.lock().map_err(|_| "O cache do GitHub ficou indisponível.".to_string())? = None;
    let _ = app.emit("edge-ghosty-github-snapshot", Option::<GithubSnapshot>::None);
    Ok(())
}

#[tauri::command]
pub fn github_cached_snapshot(app: AppHandle) -> Option<GithubSnapshot> {
    app.state::<GithubCache>().0.lock().ok()?.clone()
}

#[tauri::command]
pub async fn github_refresh(app: AppHandle, pause: State<'_, crate::tray::AppPauseState>) -> Result<GithubSnapshot, String> {
    if pause.is_paused() {
        return Err("As atualizações estão pausadas pela bandeja do sistema.".to_string());
    }
    let token = read_token()?.ok_or_else(|| "Conecte o GitHub nas Configurações para carregar seus PRs.".to_string())?;
    let snapshot = fetch_snapshot(&token, &*pause).await?;
    if pause.is_paused() {
        return Err("As atualizações foram pausadas durante a consulta.".to_string());
    }
    if read_token()?.as_deref() != Some(token.as_str()) {
        return Err("A conexão do GitHub mudou durante a consulta. Atualize a tela.".to_string());
    }
    *app.state::<GithubCache>().0.lock().map_err(|_| "O cache do GitHub ficou indisponível.".to_string())? = Some(snapshot.clone());
    let _ = app.emit("edge-ghosty-github-snapshot", Some(snapshot.clone()));
    Ok(snapshot)
}
