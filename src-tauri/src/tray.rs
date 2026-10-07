use std::sync::atomic::{AtomicBool, Ordering};
use tauri::menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, Manager, State};

#[derive(Default)]
pub struct AppPauseState(AtomicBool);

impl AppPauseState {
    fn toggle(&self) -> bool {
        !self.0.fetch_xor(true, Ordering::SeqCst)
    }

    pub fn is_paused(&self) -> bool {
        self.0.load(Ordering::SeqCst)
    }
}

#[tauri::command]
pub fn is_updates_paused(state: State<'_, AppPauseState>) -> bool {
    state.is_paused()
}

fn emit_command(app: &AppHandle, command: &str) {
    let _ = app.emit("edge-ghosty-tray-command", command);
}

pub fn install(app: &AppHandle) -> Result<(), String> {
    let open = MenuItem::with_id(app, "open", "Abrir Edge Ghosty", true, None::<&str>)
        .map_err(|error| error.to_string())?;
    let settings = MenuItem::with_id(app, "settings", "Configurações", true, None::<&str>)
        .map_err(|error| error.to_string())?;
    let pause = CheckMenuItem::with_id(app, "pause", "Pausar atualizações", true, false, None::<&str>)
        .map_err(|error| error.to_string())?;
    let separator = PredefinedMenuItem::separator(app).map_err(|error| error.to_string())?;
    let quit = PredefinedMenuItem::quit(app, Some("Sair do Edge Ghosty"))
        .map_err(|error| error.to_string())?;
    let menu = Menu::with_items(app, &[&open, &settings, &pause, &separator, &quit])
        .map_err(|error| error.to_string())?;
    let icon = app.default_window_icon().cloned().ok_or_else(|| "O ícone da bandeja não está disponível.".to_string())?;
    let pause_item = pause.clone();

    TrayIconBuilder::with_id("edge-ghosty")
        .icon(icon)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "open" => emit_command(app, "open"),
            "settings" => emit_command(app, "settings"),
            "pause" => {
                let paused = app.state::<AppPauseState>().toggle();
                let _ = pause_item.set_checked(paused);
                let _ = app.emit("edge-ghosty-pause-updated", paused);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if matches!(event, TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. }) {
                emit_command(tray.app_handle(), "open");
            }
        })
        .build(app)
        .map(|_| ())
        .map_err(|error| error.to_string())
}
