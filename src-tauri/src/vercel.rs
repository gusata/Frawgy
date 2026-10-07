use reqwest::header::{ACCEPT, AUTHORIZATION, USER_AGENT};
use serde::Serialize;
use serde_json::Value;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};

const CREDENTIAL_TARGET: &str = "Edge Ghosty/Vercel";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VercelDeployment {
    pub id: String,
    pub name: String,
    pub url: String,
    pub state: String,
    pub target: Option<String>,
    pub branch: Option<String>,
    pub commit_message: Option<String>,
    pub created_at: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VercelSnapshot {
    pub username: String,
    pub checked_at: u64,
    pub deployments: Vec<VercelDeployment>,
}

#[derive(Default)]
pub struct VercelCache(pub Mutex<Option<VercelSnapshot>>);

fn client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(18))
        .build()
        .map_err(|error| format!("Não consegui preparar a conexão com a Vercel: {error}"))
}

async fn api_get(client: &reqwest::Client, token: &str, url: &str) -> Result<Value, String> {
    let response = client
        .get(url)
        .header(USER_AGENT, "Edge-Ghosty")
        .header(ACCEPT, "application/json")
        .header(AUTHORIZATION, format!("Bearer {token}"))
        .send()
        .await
        .map_err(|error| format!("Conexão com a Vercel falhou: {error}"))?;
    let status = response.status();
    if !status.is_success() {
        return Err(match status.as_u16() {
            401 => "A Vercel recusou o token salvo. Conecte a conta novamente.".to_string(),
            403 => "Este token não tem acesso às implantações solicitadas.".to_string(),
            429 => "A Vercel limitou temporariamente esta consulta. Tente novamente em instantes.".to_string(),
            code => format!("A Vercel respondeu com HTTP {code}."),
        });
    }
    response
        .json::<Value>()
        .await
        .map_err(|error| format!("Resposta inválida da Vercel: {error}"))
}

fn token() -> Result<Option<String>, String> {
    crate::credentials::read(CREDENTIAL_TARGET)
}

fn validate_token(token: &str) -> Result<(), String> {
    if token.is_empty()
        || token.len() > 2048
        || !token.bytes().all(|byte| byte.is_ascii_graphic())
    {
        return Err("Cole um token pessoal da Vercel válido.".to_string());
    }
    Ok(())
}

fn validate_team_id(team_id: Option<&str>) -> Result<Option<&str>, String> {
    let team_id = team_id.map(str::trim).filter(|value| !value.is_empty());
    if let Some(value) = team_id {
        if value.len() > 120
            || !value
                .bytes()
                .all(|byte| byte.is_ascii_alphanumeric() || byte == b'_' || byte == b'-')
        {
            return Err("O ID da equipe Vercel deve conter apenas letras, números, hífen ou sublinhado.".to_string());
        }
    }
    Ok(team_id)
}

async fn username_for(client: &reqwest::Client, token: &str) -> Result<String, String> {
    let profile = api_get(client, token, "https://api.vercel.com/v2/user").await?;
    let user = profile.get("user").unwrap_or(&profile);
    user.get("username")
        .and_then(Value::as_str)
        .or_else(|| user.get("name").and_then(Value::as_str))
        .map(|value| value.chars().take(80).collect())
        .filter(|value: &String| !value.trim().is_empty())
        .ok_or_else(|| "A Vercel não retornou o nome da conta.".to_string())
}

fn deployment_url(value: &str) -> Option<String> {
    let candidate = if value.starts_with("https://") || value.starts_with("http://") {
        value.to_string()
    } else {
        format!("https://{value}")
    };
    let parsed = reqwest::Url::parse(&candidate).ok()?;
    if parsed.scheme() != "https"
        || parsed.host_str().is_none()
        || parsed.username() != ""
        || parsed.password().is_some()
    {
        return None;
    }
    Some(parsed.to_string())
}

fn text_at(value: &Value, key: &str, max: usize) -> Option<String> {
    value
        .get(key)
        .and_then(Value::as_str)
        .map(|value| value.chars().take(max).collect::<String>())
        .filter(|value| !value.is_empty())
}

async fn fetch_snapshot(
    token: &str,
    team_id: Option<&str>,
    pause: &crate::tray::AppPauseState,
) -> Result<VercelSnapshot, String> {
    if pause.is_paused() {
        return Err("As atualizações estão pausadas pela bandeja do sistema.".to_string());
    }
    validate_token(token)?;
    let team_id = validate_team_id(team_id)?;
    let client = client()?;
    let username = username_for(&client, token).await?;
    if pause.is_paused() {
        return Err("As atualizações foram pausadas durante a consulta.".to_string());
    }
    let mut query = vec![("limit", "5")];
    if let Some(team_id) = team_id {
        query.push(("teamId", team_id));
    }
    let url = reqwest::Url::parse_with_params("https://api.vercel.com/v6/deployments", &query)
        .map_err(|error| format!("Não consegui montar a consulta da Vercel: {error}"))?;
    let response = api_get(&client, token, url.as_str()).await?;
    let deployments = response
        .get("deployments")
        .and_then(Value::as_array)
        .ok_or_else(|| "A Vercel não retornou a lista de implantações.".to_string())?;
    let deployments = deployments
        .iter()
        .filter_map(|item| {
            let name = text_at(item, "name", 120)?;
            let url = deployment_url(item.get("url")?.as_str()?)?;
            let empty_meta = Value::Null;
            let meta = item.get("meta").unwrap_or(&empty_meta);
            Some(VercelDeployment {
                id: item
                    .get("uid")
                    .and_then(Value::as_str)
                    .or_else(|| item.get("id").and_then(Value::as_str))
                    .unwrap_or_default()
                    .chars()
                    .take(100)
                    .collect(),
                name,
                url,
                state: item
                    .get("state")
                    .and_then(Value::as_str)
                    .or_else(|| item.get("readyState").and_then(Value::as_str))
                    .unwrap_or("UNKNOWN")
                    .chars()
                    .take(32)
                    .collect(),
                target: text_at(item, "target", 32),
                branch: text_at(meta, "githubCommitRef", 100),
                commit_message: text_at(meta, "githubCommitMessage", 140),
                created_at: item
                    .get("createdAt")
                    .and_then(Value::as_u64)
                    .unwrap_or_default(),
            })
        })
        .take(5)
        .collect();
    Ok(VercelSnapshot {
        username,
        checked_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64,
        deployments,
    })
}

#[tauri::command]
pub fn vercel_token_status() -> Result<bool, String> {
    token().map(|token| token.is_some())
}

#[tauri::command]
pub async fn vercel_save_token(
    app: AppHandle,
    token_value: String,
    pause: State<'_, crate::tray::AppPauseState>,
) -> Result<String, String> {
    if pause.is_paused() {
        return Err("As atualizações estão pausadas. Retome-as pela bandeja para conectar a Vercel.".to_string());
    }
    let token_value = token_value.trim();
    validate_token(token_value)?;
    let client = client()?;
    let username = username_for(&client, token_value).await?;
    if pause.is_paused() {
        return Err("As atualizações foram pausadas durante a validação do token.".to_string());
    }
    crate::credentials::write(CREDENTIAL_TARGET, token_value)?;
    *app.state::<VercelCache>()
        .0
        .lock()
        .map_err(|_| "O cache da Vercel ficou indisponível.".to_string())? = None;
    Ok(username)
}

#[tauri::command]
pub fn vercel_clear_token(app: AppHandle) -> Result<(), String> {
    crate::credentials::delete(CREDENTIAL_TARGET)?;
    *app.state::<VercelCache>()
        .0
        .lock()
        .map_err(|_| "O cache da Vercel ficou indisponível.".to_string())? = None;
    let _ = app.emit("edge-ghosty-vercel-snapshot", Option::<VercelSnapshot>::None);
    Ok(())
}

#[tauri::command]
pub fn vercel_cached_snapshot(app: AppHandle) -> Option<VercelSnapshot> {
    app.state::<VercelCache>().0.lock().ok()?.clone()
}

#[tauri::command]
pub async fn vercel_refresh(
    app: AppHandle,
    team_id: Option<String>,
    pause: State<'_, crate::tray::AppPauseState>,
) -> Result<VercelSnapshot, String> {
    if pause.is_paused() {
        return Err("As atualizações estão pausadas pela bandeja do sistema.".to_string());
    }
    let saved_token = token()?.ok_or_else(|| "Conecte a Vercel nas Configurações para ver implantações.".to_string())?;
    let snapshot = fetch_snapshot(&saved_token, team_id.as_deref(), &*pause).await?;
    if pause.is_paused() {
        return Err("As atualizações foram pausadas durante a consulta.".to_string());
    }
    if token()?.as_deref() != Some(saved_token.as_str()) {
        return Err("A conexão da Vercel mudou durante a consulta. Atualize a tela.".to_string());
    }
    *app.state::<VercelCache>()
        .0
        .lock()
        .map_err(|_| "O cache da Vercel ficou indisponível.".to_string())? = Some(snapshot.clone());
    let _ = app.emit("edge-ghosty-vercel-snapshot", Some(snapshot.clone()));
    Ok(snapshot)
}
