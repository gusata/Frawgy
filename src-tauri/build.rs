use std::{env, fs, path::PathBuf};

fn main() {
    ensure_dev_icon();
    tauri_build::build();
}

// Tauri's Windows resource step expects an ICO even while developing. Keep a
// tiny generated placeholder here until the final Edge Ghosty branding exists.
fn ensure_dev_icon() {
    let manifest_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
    let icon_path = manifest_dir.join("icons").join("icon.ico");
    if icon_path.exists() {
        return;
    }

    const SIZE: usize = 16;
    const XOR_BYTES: usize = SIZE * SIZE * 4;
    const AND_BYTES: usize = ((SIZE + 31) / 32) * 4 * SIZE;
    const IMAGE_BYTES: usize = 40 + XOR_BYTES + AND_BYTES;

    let mut bytes = Vec::with_capacity(22 + IMAGE_BYTES);
    bytes.extend_from_slice(&[0, 0, 1, 0, 1, 0]); // ICO header
    bytes.extend_from_slice(&[SIZE as u8, SIZE as u8, 0, 0, 1, 0, 32, 0]);
    bytes.extend_from_slice(&(IMAGE_BYTES as u32).to_le_bytes());
    bytes.extend_from_slice(&22u32.to_le_bytes());

    // BITMAPINFOHEADER: 16x16, 32-bit BGRA, followed by XOR and AND masks.
    bytes.extend_from_slice(&40u32.to_le_bytes());
    bytes.extend_from_slice(&(SIZE as i32).to_le_bytes());
    bytes.extend_from_slice(&((SIZE * 2) as i32).to_le_bytes());
    bytes.extend_from_slice(&1u16.to_le_bytes());
    bytes.extend_from_slice(&32u16.to_le_bytes());
    bytes.extend_from_slice(&0u32.to_le_bytes());
    bytes.extend_from_slice(&(XOR_BYTES as u32).to_le_bytes());
    bytes.extend_from_slice(&[0; 16]);
    bytes.extend(std::iter::repeat_n(0u8, XOR_BYTES));
    bytes.extend(std::iter::repeat_n(0u8, AND_BYTES));

    fs::create_dir_all(icon_path.parent().unwrap()).unwrap();
    fs::write(icon_path, bytes).unwrap();
}
