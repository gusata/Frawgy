use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Command;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};
use tauri::window::Monitor;
use tauri::{
    AppHandle, Emitter, Manager, PhysicalPosition, PhysicalSize, State, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder,
};
use windows::Win32::Foundation::{GlobalFree, HANDLE, HGLOBAL, POINT};
use windows::Win32::Media::Audio::Endpoints::IAudioEndpointVolume;
use windows::Win32::Media::Audio::{eConsole, eRender, IMMDeviceEnumerator, MMDeviceEnumerator};
use windows::Win32::System::Com::{
    CoCreateInstance, CoInitializeEx, CLSCTX_ALL, COINIT_APARTMENTTHREADED,
};
use windows::Win32::System::DataExchange::{
    CloseClipboard, EmptyClipboard, GetClipboardData, OpenClipboard, SetClipboardData,
};
use windows::Win32::System::Memory::{
    GlobalAlloc, GlobalLock, GlobalUnlock, GMEM_MOVEABLE,
};
use windows::Win32::System::Ole::CF_UNICODETEXT;
use windows::Win32::UI::Input::KeyboardAndMouse::{
    keybd_event, GetAsyncKeyState, KEYEVENTF_KEYUP, VK_LBUTTON, VK_MEDIA_NEXT_TRACK,
    VK_MEDIA_PLAY_PAUSE, VK_MEDIA_PREV_TRACK,
};
use windows::Win32::UI::Shell::ShellExecuteW;
use windows::Win32::UI::WindowsAndMessaging::{
    GetCursorPos, SetWindowPos, HWND_TOPMOST, SWP_NOACTIVATE, SW_SHOWNORMAL,
};
use windows::core::PCWSTR;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DisplayInfo {
    id: String,
    name: String,
    width: u32,
    height: u32,
    is_primary: bool,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct LayoutUpdate {
    edge: String,
    bar_length: u32,
    bar_thickness: u32,
    close_delay: u32,
    all_displays: bool,
    selected_display_ids: Vec<String>,
    display_ids: Vec<String>,
    active_label: String,
    expanded: bool,
}

#[derive(Clone, Copy, Default)]
struct IslandRect {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
}

#[derive(Clone, Copy, Serialize)]
struct CursorPosition {
    x: f64,
    y: f64,
    inside: bool,
    dragging: bool,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct MediaInfo {
    title: String,
    artist: String,
    playing: bool,
}

#[derive(Default)]
struct CursorState {
    rects: Arc<Mutex<HashMap<String, IslandRect>>>,
    ignoring: Arc<Mutex<HashMap<String, bool>>>,
}

const CURSOR_HIT_MARGIN: f64 = 14.0;

#[derive(Clone, Copy)]
enum Edge {
    Left,
    Top,
    Bottom,
}

impl Edge {
    fn parse(value: &str) -> Result<Self, String> {
        match value {
            "left" => Ok(Self::Left),
            "top" => Ok(Self::Top),
            "bottom" => Ok(Self::Bottom),
            _ => Err(format!("borda desconhecida: {value}")),
        }
    }
}

#[tauri::command]
fn system_volume(value: u8) -> Result<u8, String> {
    let value = value.min(100);
    unsafe {
        let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
        let enumerator: IMMDeviceEnumerator =
            CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)
                .map_err(|error| format!("audio enumerator: {error}"))?;
        let device = enumerator
            .GetDefaultAudioEndpoint(eRender, eConsole)
            .map_err(|error| format!("default audio device: {error}"))?;
        let endpoint: IAudioEndpointVolume = device
            .Activate(CLSCTX_ALL, None)
            .map_err(|error| format!("audio endpoint: {error}"))?;
        endpoint
            .SetMasterVolumeLevelScalar(value as f32 / 100.0, std::ptr::null())
            .map_err(|error| format!("set volume: {error}"))?;
    }
    Ok(value)
}

#[tauri::command]
fn get_system_volume() -> Result<u8, String> {
    unsafe {
        let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
        let enumerator: IMMDeviceEnumerator =
            CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)
                .map_err(|error| format!("audio enumerator: {error}"))?;
        let device = enumerator
            .GetDefaultAudioEndpoint(eRender, eConsole)
            .map_err(|error| format!("default audio device: {error}"))?;
        let endpoint: IAudioEndpointVolume = device
            .Activate(CLSCTX_ALL, None)
            .map_err(|error| format!("audio endpoint: {error}"))?;
        let scalar = endpoint
            .GetMasterVolumeLevelScalar()
            .map_err(|error| format!("read volume: {error}"))?;
        Ok((scalar * 100.0).round().clamp(0.0, 100.0) as u8)
    }
}

#[tauri::command]
fn read_clipboard_text() -> Result<String, String> {
    unsafe { OpenClipboard(None) }.map_err(|error| format!("abrir prancheta: {error}"))?;
    let result = unsafe { GetClipboardData(CF_UNICODETEXT.0 as u32) }
        .map_err(|error| format!("ler prancheta: {error}"))
        .and_then(|handle| {
            let memory = HGLOBAL(handle.0);
            let pointer = unsafe { GlobalLock(memory) } as *const u16;
            if pointer.is_null() {
                return Err("não foi possível acessar o texto copiado".to_string());
            }
            let mut length = 0usize;
            while length < 1_000_000 && unsafe { *pointer.add(length) } != 0 {
                length += 1;
            }
            let text = String::from_utf16_lossy(unsafe { std::slice::from_raw_parts(pointer, length) });
            let _ = unsafe { GlobalUnlock(memory) };
            Ok(text)
        });
    let _ = unsafe { CloseClipboard() };
    result
}

#[tauri::command]
fn write_clipboard_text(text: String) -> Result<(), String> {
    if text.len() > 1_000_000 {
        return Err("o texto é grande demais para a prancheta do Mochi".to_string());
    }
    let wide: Vec<u16> = text.encode_utf16().chain(std::iter::once(0)).collect();
    unsafe { OpenClipboard(None) }.map_err(|error| format!("abrir prancheta: {error}"))?;
    if let Err(error) = unsafe { EmptyClipboard() } {
        let _ = unsafe { CloseClipboard() };
        return Err(format!("limpar prancheta: {error}"));
    }
    let memory = match unsafe { GlobalAlloc(GMEM_MOVEABLE, wide.len() * std::mem::size_of::<u16>()) } {
        Ok(memory) => memory,
        Err(error) => {
            let _ = unsafe { CloseClipboard() };
            return Err(format!("reservar texto da prancheta: {error}"));
        }
    };
    let pointer = unsafe { GlobalLock(memory) } as *mut u16;
    if pointer.is_null() {
        let _ = unsafe { GlobalFree(Some(memory)) };
        let _ = unsafe { CloseClipboard() };
        return Err("não foi possível gravar na prancheta".to_string());
    }
    unsafe { std::ptr::copy_nonoverlapping(wide.as_ptr(), pointer, wide.len()) };
    let _ = unsafe { GlobalUnlock(memory) };
    let result = unsafe { SetClipboardData(CF_UNICODETEXT.0 as u32, Some(HANDLE(memory.0))) }
        .map(|_| ())
        .map_err(|error| {
            let _ = unsafe { GlobalFree(Some(memory)) };
            format!("copiar para a prancheta: {error}")
        });
    let _ = unsafe { CloseClipboard() };
    result
}

#[tauri::command]
fn media_control(action: String) -> Result<(), String> {
    let key = match action.as_str() {
        "play-pause" => VK_MEDIA_PLAY_PAUSE,
        "next" => VK_MEDIA_NEXT_TRACK,
        "previous" => VK_MEDIA_PREV_TRACK,
        _ => return Err(format!("controle de mídia desconhecido: {action}")),
    };
    unsafe {
        keybd_event(key.0 as u8, 0, Default::default(), 0);
        keybd_event(key.0 as u8, 0, KEYEVENTF_KEYUP, 0);
    }
    Ok(())
}

#[tauri::command]
fn get_media_info() -> MediaInfo {
    const SCRIPT: &str = r#"
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() |
  Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } |
  Select-Object -First 1
function Await-WinRT($operation, $resultType) {
  $task = $asTask.MakeGenericMethod($resultType).Invoke($null, @($operation))
  $task.GetAwaiter().GetResult()
}
$managerType = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]
$managerRequest = $managerType.GetMethod('RequestAsync').Invoke($null, @())
$manager = Await-WinRT $managerRequest $managerType
$session = $manager.GetCurrentSession()
if ($null -eq $session) { [pscustomobject]@{ title = ''; artist = ''; playing = $false } | ConvertTo-Json -Compress; exit }
$propsType = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties, Windows.Media.Control, ContentType = WindowsRuntime]
$props = Await-WinRT ($session.TryGetMediaPropertiesAsync()) $propsType
$playback = $session.GetPlaybackInfo()
[pscustomobject]@{ title = [string]$props.Title; artist = [string]$props.Artist; playing = ([string]$playback.PlaybackStatus -eq 'Playing') } | ConvertTo-Json -Compress
"#;
    let output = Command::new("powershell.exe")
        .args(["-NoProfile", "-NonInteractive", "-STA", "-Command", SCRIPT])
        .output();
    if let Ok(output) = output {
        if output.status.success() {
            if let Ok(info) = serde_json::from_slice::<MediaInfo>(&output.stdout) {
                return info;
            }
        }
    }
    MediaInfo { title: String::new(), artist: String::new(), playing: false }
}

#[tauri::command]
fn open_targets(targets: Vec<String>) -> Result<(), String> {
    if targets.is_empty() {
        return Err("adicione pelo menos um aplicativo, arquivo ou endereço".to_string());
    }
    for target in targets.iter().map(|target| target.trim()).filter(|target| !target.is_empty()) {
        let operation: Vec<u16> = "open".encode_utf16().chain(std::iter::once(0)).collect();
        let file: Vec<u16> = target.encode_utf16().chain(std::iter::once(0)).collect();
        let result = unsafe {
            ShellExecuteW(
                None,
                PCWSTR(operation.as_ptr()),
                PCWSTR(file.as_ptr()),
                PCWSTR::null(),
                PCWSTR::null(),
                SW_SHOWNORMAL,
            )
        };
        if result.0 as isize <= 32 {
            return Err(format!("não foi possível abrir: {target}"));
        }
    }
    Ok(())
}

#[tauri::command]
fn run_shortcut(name: String) -> Result<(), String> {
    let target = match name.as_str() {
        "Terminal" => ("wt.exe", ""),
        "Captura" => ("explorer.exe", "ms-screenclip:"),
        "Foco" => ("explorer.exe", "ms-settings:quiethours"),
        _ => return Err(format!("atalho desconhecido: {name}")),
    };
    let mut command = Command::new(target.0);
    if !target.1.is_empty() {
        command.arg(target.1);
    }
    command
        .spawn()
        .map(|_| ())
        .map_err(|error| error.to_string())
}

fn display_id(monitor: &Monitor) -> String {
    let position = monitor.position();
    format!(
        "{}:{}:{}",
        monitor.name().map(String::as_str).unwrap_or("display"),
        position.x,
        position.y
    )
}

fn is_primary_monitor(monitor: &Monitor, primary: Option<&Monitor>) -> bool {
    primary.is_some_and(|primary| display_id(monitor) == display_id(primary))
}

#[tauri::command]
fn list_displays(window: WebviewWindow) -> Result<Vec<DisplayInfo>, String> {
    let monitors = window
        .available_monitors()
        .map_err(|error| error.to_string())?;
    let primary = window
        .primary_monitor()
        .map_err(|error| error.to_string())?;
    let mut displays: Vec<_> = monitors
        .iter()
        .map(|monitor| {
            let size = monitor.size();
            DisplayInfo {
                id: display_id(monitor),
                name: monitor
                    .name()
                    .cloned()
                    .unwrap_or_else(|| "Monitor".to_string()),
                width: size.width,
                height: size.height,
                is_primary: is_primary_monitor(monitor, primary.as_ref()),
            }
        })
        .collect();
    displays.sort_by_key(|display| !display.is_primary);
    Ok(displays)
}

fn logical_to_physical(value: u32, scale_factor: f64) -> u32 {
    (f64::from(value) * scale_factor).round().max(1.0) as u32
}

#[tauri::command]
fn set_island_rect(
    window: WebviewWindow,
    state: State<CursorState>,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    if !x.is_finite() || !y.is_finite() || !width.is_finite() || !height.is_finite() {
        return Err("geometria do notch inválida".to_string());
    }
    state.rects.lock().unwrap().insert(
        window.label().to_string(),
        IslandRect {
            x,
            y,
            width,
            height,
        },
    );
    Ok(())
}

fn spawn_cursor_poll(
    app: AppHandle,
    rects: Arc<Mutex<HashMap<String, IslandRect>>>,
    ignoring: Arc<Mutex<HashMap<String, bool>>>,
) {
    thread::spawn(move || {
        let mut last_positions: HashMap<String, (f64, f64, bool, bool)> = HashMap::new();
        let mut last_cursor_events: HashMap<String, Instant> = HashMap::new();
        loop {
            let mut cursor = POINT::default();
            if unsafe { GetCursorPos(&mut cursor) }.is_err() {
                thread::sleep(Duration::from_millis(16));
                continue;
            }

            for (label, window) in app.webview_windows() {
                if label != "main" && !label.starts_with("display-") {
                    continue;
                }
                if window.is_visible().ok() != Some(true) {
                    last_positions.remove(&label);
                    last_cursor_events.remove(&label);
                    continue;
                }
                let rect = rects.lock().unwrap().get(&label).copied();
                let Some(rect) = rect else {
                    if ignoring.lock().unwrap().get(&label).copied() != Some(true)
                        && window.set_ignore_cursor_events(true).is_ok()
                    {
                        let _ = window.set_always_on_top(true);
                        ignoring.lock().unwrap().insert(label.clone(), true);
                    }
                    last_positions.remove(&label);
                    last_cursor_events.remove(&label);
                    continue;
                };
                let Ok(origin) = window.outer_position() else {
                    continue;
                };
                let scale = window.scale_factor().unwrap_or(1.0);
                let x = (cursor.x - origin.x) as f64 / scale;
                let y = (cursor.y - origin.y) as f64 / scale;
                let dragging = unsafe { GetAsyncKeyState(VK_LBUTTON.0 as i32) } < 0;
                let margin = if dragging { 0.0 } else { CURSOR_HIT_MARGIN };
                // While dragging, activate only over the currently visible island; its published rect grows with the opening animation.
                let inside = x >= rect.x - margin
                    && x <= rect.x + rect.width + margin
                    && y >= rect.y - margin
                    && y <= rect.y + rect.height + margin;
                let position = CursorPosition { x, y, inside, dragging };
                let ignore = !inside;
                if ignoring.lock().unwrap().get(&label).copied() != Some(ignore)
                    && window.set_ignore_cursor_events(ignore).is_ok()
                {
                    let _ = window.set_always_on_top(true);
                    ignoring.lock().unwrap().insert(label.clone(), ignore);
                }

                let moved = last_positions.get(&label).map_or(true, |last| {
                    (position.x - last.0).abs() >= 1.0
                        || (position.y - last.1).abs() >= 1.0
                        || inside != last.2
                        || dragging != last.3
                });
                last_positions.insert(label.clone(), (position.x, position.y, inside, dragging));
                let retry_hover_event = inside
                    && last_cursor_events
                        .get(&label)
                        .map_or(true, |last| last.elapsed() >= Duration::from_millis(100));
                if moved || retry_hover_event {
                    let _ = app.emit_to(label.as_str(), "edge-mochi-cursor", position);
                    last_cursor_events.insert(label.clone(), Instant::now());
                }
            }
            thread::sleep(Duration::from_millis(16));
        }
    });
}

fn window_geometry(edge: Edge, monitor: &Monitor) -> (PhysicalSize<u32>, PhysicalPosition<i32>) {
    let scale = monitor.scale_factor();
    let monitor_position = monitor.position();
    let monitor_size = monitor.size();
    let logical_size = match edge {
        Edge::Left => (
            400,
            720.min((f64::from(monitor_size.height) / scale) as u32),
        ),
        Edge::Top | Edge::Bottom => (
            840.min((f64::from(monitor_size.width) / scale) as u32),
            320.min((f64::from(monitor_size.height) / scale) as u32),
        ),
    };
    let size = PhysicalSize::new(
        logical_to_physical(logical_size.0, scale),
        logical_to_physical(logical_size.1, scale),
    );
    let remaining_x = monitor_size.width.saturating_sub(size.width);
    let remaining_y = monitor_size.height.saturating_sub(size.height);
    let along = |remaining: u32| remaining / 2;
    let x = match edge {
        Edge::Left => monitor_position.x,
        Edge::Top | Edge::Bottom => monitor_position.x + along(remaining_x) as i32,
    };
    let y = match edge {
        Edge::Left => monitor_position.y + along(remaining_y) as i32,
        Edge::Top => monitor_position.y,
        Edge::Bottom => monitor_position.y + remaining_y as i32,
    };
    (size, PhysicalPosition::new(x, y))
}

fn collapsed_island_rect(
    edge: Edge,
    bar_length: u32,
    bar_thickness: u32,
    monitor: &Monitor,
) -> IslandRect {
    let scale = monitor.scale_factor();
    let (host_size, _) = window_geometry(edge, monitor);
    let host_width = f64::from(host_size.width) / scale;
    let host_height = f64::from(host_size.height) / scale;
    let length = f64::from(bar_length);
    let thickness = f64::from(bar_thickness);

    match edge {
        Edge::Left => IslandRect {
            x: 0.0,
            y: (host_height - length) / 2.0,
            width: thickness,
            height: length,
        },
        Edge::Top => IslandRect {
            x: (host_width - length) / 2.0,
            y: 0.0,
            width: length,
            height: thickness,
        },
        Edge::Bottom => IslandRect {
            x: (host_width - length) / 2.0,
            y: host_height - thickness,
            width: length,
            height: thickness,
        },
    }
}

fn place_window(window: &WebviewWindow, edge: Edge, monitor: &Monitor) -> Result<(), String> {
    let (size, location) = window_geometry(edge, monitor);
    let handle = window.hwnd().map_err(|error| error.to_string())?;
    unsafe {
        SetWindowPos(
            handle,
            Some(HWND_TOPMOST),
            location.x,
            location.y,
            size.width as i32,
            size.height as i32,
            SWP_NOACTIVATE,
        )
        .map_err(|error| error.to_string())?;
    }
    window
        .set_always_on_top(true)
        .map_err(|error| error.to_string())
}

fn ensure_display_windows(app: &AppHandle, count: usize) -> Result<(), String> {
    for index in 1..count {
        let label = format!("display-{index}");
        if app.get_webview_window(&label).is_some() {
            continue;
        }
        WebviewWindowBuilder::new(app, label, WebviewUrl::App("index.html".into()))
            .title("Edge Mochi")
            .inner_size(400.0, 720.0)
            .decorations(false)
            .transparent(true)
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .focused(false)
            .visible(false)
            .build()
            .map_err(|error| error.to_string())?;
        let window = app
            .get_webview_window(&format!("display-{index}"))
            .ok_or_else(|| "janela do monitor não encontrada".to_string())?;
        window
            .set_ignore_cursor_events(true)
            .map_err(|error| error.to_string())?;
        window
            .set_always_on_top(true)
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn apply_display_layout(
    app: AppHandle,
    window: WebviewWindow,
    state: State<'_, CursorState>,
    edge: String,
    bar_length: u32,
    bar_thickness: u32,
    display_ids: Vec<String>,
    selected_display_ids: Vec<String>,
    all_displays: bool,
    close_delay: u32,
    expanded: bool,
) -> Result<(), String> {
    let edge = Edge::parse(&edge)?;
    let monitors = app
        .available_monitors()
        .map_err(|error| error.to_string())?;
    ensure_display_windows(&app, monitors.len())?;
    let primary = app.primary_monitor().map_err(|error| error.to_string())?;
    let mut selected: Vec<_> = monitors
        .iter()
        .filter(|monitor| display_ids.contains(&display_id(monitor)))
        .collect();
    selected.sort_by_key(|monitor| !is_primary_monitor(monitor, primary.as_ref()));
    if selected.is_empty() {
        selected = monitors
            .iter()
            .filter(|monitor| is_primary_monitor(monitor, primary.as_ref()))
            .collect();
    }
    if selected.is_empty() {
        return Err("nenhum monitor disponível".to_string());
    }

    let mut windows: Vec<_> = app
        .webview_windows()
        .into_iter()
        .filter(|(label, _)| label == "main" || label.starts_with("display-"))
        .collect();
    windows.sort_by_key(|(label, _)| {
        if label == "main" {
            0
        } else {
            label
                .strip_prefix("display-")
                .and_then(|number| number.parse::<usize>().ok())
                .unwrap_or(usize::MAX)
        }
    });

    let active_label = window.label().to_string();
    for (index, (_, target_window)) in windows.iter().enumerate() {
        if let Some(monitor) = selected.get(index) {
            place_window(target_window, edge, monitor)?;
            target_window.show().map_err(|error| error.to_string())?;
            target_window
                .set_always_on_top(true)
                .map_err(|error| error.to_string())?;
            state.rects.lock().unwrap().insert(
                target_window.label().to_string(),
                collapsed_island_rect(edge, bar_length, bar_thickness, monitor),
            );
        } else {
            target_window.hide().map_err(|error| error.to_string())?;
            state.rects.lock().unwrap().remove(target_window.label());
        }
    }
    app.emit(
        "edge-mochi-layout-updated",
        LayoutUpdate {
            edge: match edge {
                Edge::Left => "left",
                Edge::Top => "top",
                Edge::Bottom => "bottom",
            }
            .to_string(),
            bar_length,
            bar_thickness,
            close_delay,
            all_displays,
            selected_display_ids,
            display_ids,
            active_label,
            expanded,
        },
    )
    .map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(CursorState::default())
        .setup(|app| {
            let cursor_state = app.state::<CursorState>();
            spawn_cursor_poll(
                app.handle().clone(),
                cursor_state.rects.clone(),
                cursor_state.ignoring.clone(),
            );
            if let Some(window) = app.get_webview_window("main") {
                if let Some(monitor) = window.primary_monitor()? {
                    window.set_ignore_cursor_events(true)?;
                    window.set_always_on_top(true)?;
                    place_window(&window, Edge::Left, &monitor).map_err(std::io::Error::other)?;
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            system_volume,
            get_system_volume,
            read_clipboard_text,
            write_clipboard_text,
            media_control,
            get_media_info,
            open_targets,
            run_shortcut,
            list_displays,
            set_island_rect,
            apply_display_layout
        ])
        .run(tauri::generate_context!())
        .expect("error while running Edge Mochi");
}
