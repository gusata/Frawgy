use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

const MOCHI_HOOK_NAME: &str = "edge-mochi-codex-hook.ps1";
const HOOK_EVENTS: &[&str] = &[
    "SessionStart",
    "UserPromptSubmit",
    "PreToolUse",
    "PermissionRequest",
    "PostToolUse",
    "SubagentStart",
    "SubagentStop",
    "Stop",
    "Interrupt",
    "SessionEnd",
];

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CodexHookEvent {
    pub event_name: String,
    pub occurred_at: u64,
    pub tool_name: Option<String>,
    pub agent_type: Option<String>,
}

struct BridgePaths {
    config: PathBuf,
    directory: PathBuf,
    disabled: PathBuf,
    script: PathBuf,
    events: PathBuf,
}

fn bridge_paths(app: &AppHandle) -> Result<BridgePaths, String> {
    let app_directory = app
        .path()
        .app_local_data_dir()
        .map_err(|error| format!("diretório local do Mochi: {error}"))?;
    let directory = app_directory.join("codex");
    let codex_home = env::var_os("CODEX_HOME")
        .map(PathBuf::from)
        .or_else(|| env::var_os("USERPROFILE").map(|profile| PathBuf::from(profile).join(".codex")))
        .ok_or_else(|| "não encontrei a pasta de configuração do Codex neste usuário".to_string())?;

    Ok(BridgePaths {
        config: codex_home.join("hooks.json"),
        script: directory.join(MOCHI_HOOK_NAME),
        disabled: directory.join("disabled.flag"),
        events: directory.join("events"),
        directory,
    })
}

fn load_config(path: &Path) -> Result<(Value, bool), String> {
    if !path.exists() {
        return Ok((json!({}), false));
    }
    let contents = fs::read(path).map_err(|error| format!("não consegui ler hooks.json do Codex: {error}"))?;
    let config: Value = serde_json::from_slice(&contents)
        .map_err(|error| format!("hooks.json do Codex não contém JSON válido: {error}"))?;
    let object = config
        .as_object()
        .ok_or_else(|| "hooks.json do Codex precisa conter um objeto JSON".to_string())?;
    if object.get("hooks").is_some_and(|hooks| !hooks.is_object()) {
        return Err("a propriedade hooks do hooks.json do Codex precisa ser um objeto".to_string());
    }
    Ok((config, true))
}

fn is_mochi_handler(handler: &Value) -> bool {
    ["command", "commandWindows"].iter().any(|key| {
        handler
            .get(key)
            .and_then(Value::as_str)
            .is_some_and(|command| command.to_ascii_lowercase().contains(MOCHI_HOOK_NAME))
    })
}

fn is_mochi_group(group: &Value) -> bool {
    group
        .get("hooks")
        .and_then(Value::as_array)
        .is_some_and(|handlers| handlers.iter().any(is_mochi_handler))
}

fn remove_mochi_groups(config: &mut Value) -> Result<bool, String> {
    let mut removed = false;

    if let Some(hooks_value) = config.get_mut("hooks") {
        let hooks = hooks_value
            .as_object_mut()
            .ok_or_else(|| "a propriedade hooks do hooks.json do Codex precisa ser um objeto".to_string())?;
        for (event_name, groups_value) in hooks.iter_mut() {
            let groups = groups_value
                .as_array_mut()
                .ok_or_else(|| format!("a configuração hooks.{event_name} do Codex precisa ser uma lista"))?;
            let mut index = 0;
            while index < groups.len() {
                let handlers_empty = if let Some(handlers) = groups[index].get_mut("hooks").and_then(Value::as_array_mut) {
                    let old_length = handlers.len();
                    handlers.retain(|handler| !is_mochi_handler(handler));
                    removed |= old_length != handlers.len();
                    handlers.is_empty()
                } else {
                    false
                };
                let remove_group = handlers_empty
                    && groups[index]
                        .as_object()
                        .is_some_and(|group| group.len() == 1 && group.contains_key("hooks"));
                if remove_group {
                    groups.remove(index);
                } else {
                    index += 1;
                }
            }
        }
    }
    Ok(removed)
}

fn write_config(path: &Path, config: &Value) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or_else(|| "não encontrei a pasta de configuração do Codex".to_string())?;
    fs::create_dir_all(parent).map_err(|error| format!("não consegui preparar a pasta do Codex: {error}"))?;
    let mut temporary = path.as_os_str().to_os_string();
    temporary.push(".edge-mochi.tmp");
    let temporary = PathBuf::from(temporary);
    let contents = serde_json::to_vec_pretty(config)
        .map_err(|error| format!("não consegui montar hooks.json do Codex: {error}"))?;
    fs::write(&temporary, contents).map_err(|error| format!("não consegui salvar hooks.json do Codex: {error}"))?;
    if let Err(error) = fs::rename(&temporary, path) {
        let _ = fs::remove_file(&temporary);
        return Err(format!("não consegui atualizar hooks.json do Codex: {error}"));
    }
    Ok(())
}

fn hook_command(script: &Path, events: &Path) -> String {
    format!(
        "powershell.exe -NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File \"{}\" -QueueDirectory \"{}\"",
        script.display(),
        events.display()
    )
}

fn add_mochi_groups(config: &mut Value, command: &str) -> Result<(), String> {
    let root = config
        .as_object_mut()
        .ok_or_else(|| "hooks.json do Codex precisa conter um objeto JSON".to_string())?;
    let hooks = root
        .entry("hooks".to_string())
        .or_insert_with(|| Value::Object(Map::new()))
        .as_object_mut()
        .ok_or_else(|| "a propriedade hooks do hooks.json do Codex precisa ser um objeto".to_string())?;

    for event_name in HOOK_EVENTS {
        let groups = hooks
            .entry((*event_name).to_string())
            .or_insert_with(|| Value::Array(Vec::new()))
            .as_array_mut()
            .ok_or_else(|| format!("a configuração hooks.{event_name} do Codex precisa ser uma lista"))?;
        groups.push(json!({
            "hooks": [{
                "type": "command",
                "command": command,
                "commandWindows": command,
                "async": true,
                "timeout": 3
            }]
        }));
    }
    Ok(())
}

#[tauri::command]
pub fn codex_hooks_enabled(app: AppHandle) -> Result<bool, String> {
    let paths = bridge_paths(&app)?;
    if paths.disabled.exists() {
        return Ok(false);
    }
    let (config, exists) = load_config(&paths.config)?;
    if !exists {
        return Ok(false);
    }
    let Some(hooks) = config.get("hooks").and_then(Value::as_object) else {
        return Ok(false);
    };
    Ok(hooks
        .values()
        .filter_map(Value::as_array)
        .flatten()
        .any(is_mochi_group))
}

#[tauri::command]
pub fn set_codex_hooks_enabled(app: AppHandle, enabled: bool) -> Result<bool, String> {
    let paths = bridge_paths(&app)?;
    let (mut config, exists) = load_config(&paths.config)?;

    if !enabled {
        if exists && remove_mochi_groups(&mut config)? {
            write_config(&paths.config, &config)?;
        }
        if paths.events.exists() {
            let _ = fs::remove_dir_all(&paths.events);
        }
        fs::create_dir_all(&paths.directory).map_err(|error| format!("não consegui desativar o hook local do Codex: {error}"))?;
        fs::write(&paths.disabled, b"disabled\n")
            .map_err(|error| format!("não consegui desativar o hook local do Codex: {error}"))?;
        return Ok(false);
    }

    fs::create_dir_all(&paths.directory).map_err(|error| format!("não consegui preparar a integração com Codex: {error}"))?;
    fs::create_dir_all(&paths.events).map_err(|error| format!("não consegui preparar a fila de eventos do Codex: {error}"))?;
    fs::write(&paths.script, include_str!("codex-hook.ps1"))
        .map_err(|error| format!("não consegui instalar o hook local do Codex: {error}"))?;

    remove_mochi_groups(&mut config)?;
    let command = hook_command(&paths.script, &paths.events);
    add_mochi_groups(&mut config, &command)?;
    write_config(&paths.config, &config)?;
    if paths.disabled.exists() {
        fs::remove_file(&paths.disabled)
            .map_err(|error| format!("não consegui reativar o hook local do Codex: {error}"))?;
    }
    Ok(true)
}

fn event_is_supported(event_name: &str) -> bool {
    HOOK_EVENTS.contains(&event_name)
}

fn unix_time_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or_default()
}

#[tauri::command]
pub fn drain_codex_events(app: AppHandle) -> Result<Vec<CodexHookEvent>, String> {
    let paths = bridge_paths(&app)?;
    if !paths.events.exists() {
        return Ok(Vec::new());
    }
    let mut files = fs::read_dir(&paths.events)
        .map_err(|error| format!("não consegui ler eventos locais do Codex: {error}"))?
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| path.extension().and_then(|extension| extension.to_str()) == Some("json"))
        .collect::<Vec<_>>();
    files.sort();

    let now = unix_time_ms();
    let oldest = now.saturating_sub(15_000);
    let mut events = Vec::new();
    for path in files.into_iter().take(128) {
        let parsed = fs::read(&path)
            .ok()
            .and_then(|contents| serde_json::from_slice::<CodexHookEvent>(&contents).ok());
        let _ = fs::remove_file(path);
        if let Some(event) = parsed {
            if event_is_supported(&event.event_name)
                && event.occurred_at >= oldest
                && event.occurred_at <= now.saturating_add(5_000)
            {
                events.push(event);
            }
        }
    }
    Ok(events)
}
