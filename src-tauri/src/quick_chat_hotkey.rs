use std::thread;
use tauri::{AppHandle, Emitter};
use windows::Win32::UI::Input::KeyboardAndMouse::{
    RegisterHotKey, UnregisterHotKey, MOD_CONTROL, MOD_NOREPEAT, MOD_SHIFT, VK_SPACE,
};
use windows::Win32::UI::WindowsAndMessaging::{GetMessageW, MSG, WM_HOTKEY};

const QUICK_CHAT_HOTKEY_ID: i32 = 0x4748;

pub fn start(app: AppHandle) {
    let _ = thread::Builder::new()
        .name("edge-ghosty-quick-chat-hotkey".into())
        .spawn(move || unsafe {
            if let Err(error) = RegisterHotKey(
                None,
                QUICK_CHAT_HOTKEY_ID,
                MOD_CONTROL | MOD_SHIFT | MOD_NOREPEAT,
                VK_SPACE.0 as u32,
            ) {
                let _ = app.emit("edge-ghosty-quick-chat-hotkey-error", error.to_string());
                return;
            }

            loop {
                let mut message = MSG::default();
                if !GetMessageW(&mut message, None, 0, 0).as_bool() {
                    break;
                }
                if message.message == WM_HOTKEY && message.wParam.0 == QUICK_CHAT_HOTKEY_ID as usize {
                    let _ = app.emit("edge-ghosty-quick-chat", ());
                }
            }

            let _ = UnregisterHotKey(None, QUICK_CHAT_HOTKEY_ID);
        });
}
