use std::ffi::c_void;
use std::ptr;

const CRED_TYPE_GENERIC: u32 = 1;
const CRED_PERSIST_LOCAL_MACHINE: u32 = 2;
const ERROR_NOT_FOUND: u32 = 1168;

#[repr(C)]
struct FileTime {
    low: u32,
    high: u32,
}

#[repr(C)]
struct CredentialAttributeW {
    keyword: *mut u16,
    flags: u32,
    value_size: u32,
    value: *mut u8,
}

#[repr(C)]
struct CredentialW {
    flags: u32,
    kind: u32,
    target_name: *mut u16,
    comment: *mut u16,
    last_written: FileTime,
    credential_blob_size: u32,
    credential_blob: *mut u8,
    persist: u32,
    attribute_count: u32,
    attributes: *mut CredentialAttributeW,
    target_alias: *mut u16,
    user_name: *mut u16,
}

#[link(name = "Advapi32")]
extern "system" {
    fn CredWriteW(credential: *const CredentialW, flags: u32) -> i32;
    fn CredReadW(target: *const u16, kind: u32, flags: u32, credential: *mut *mut CredentialW) -> i32;
    fn CredDeleteW(target: *const u16, kind: u32, flags: u32) -> i32;
    fn CredFree(buffer: *mut c_void);
}

#[link(name = "Kernel32")]
extern "system" {
    fn GetLastError() -> u32;
}

fn wide(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(std::iter::once(0)).collect()
}

pub fn write(target_name: &str, secret: &str) -> Result<(), String> {
    let target = wide(target_name);
    let bytes = secret.as_bytes();
    let credential = CredentialW {
        flags: 0,
        kind: CRED_TYPE_GENERIC,
        target_name: target.as_ptr() as *mut u16,
        comment: ptr::null_mut(),
        last_written: FileTime { low: 0, high: 0 },
        credential_blob_size: bytes.len() as u32,
        credential_blob: bytes.as_ptr() as *mut u8,
        persist: CRED_PERSIST_LOCAL_MACHINE,
        attribute_count: 0,
        attributes: ptr::null_mut(),
        target_alias: ptr::null_mut(),
        user_name: ptr::null_mut(),
    };
    if unsafe { CredWriteW(&credential, 0) } == 0 {
        return Err(format!("Não consegui salvar a credencial no Windows (código {}).", unsafe { GetLastError() }));
    }
    Ok(())
}

pub fn read(target_name: &str) -> Result<Option<String>, String> {
    let target = wide(target_name);
    let mut credential = ptr::null_mut();
    if unsafe { CredReadW(target.as_ptr(), CRED_TYPE_GENERIC, 0, &mut credential) } == 0 {
        let code = unsafe { GetLastError() };
        return if code == ERROR_NOT_FOUND {
            Ok(None)
        } else {
            Err(format!("Não consegui ler a credencial do Windows (código {code})."))
        };
    }
    if credential.is_null() {
        return Err("O Gerenciador de Credenciais retornou um registro vazio.".to_string());
    }
    let result = unsafe {
        let size = (*credential).credential_blob_size as usize;
        let blob = (*credential).credential_blob;
        if size == 0 || blob.is_null() {
            Err("A credencial salva está vazia.".to_string())
        } else {
            String::from_utf8(std::slice::from_raw_parts(blob, size).to_vec())
                .map_err(|_| "A credencial salva não contém texto UTF-8 válido.".to_string())
        }
    };
    unsafe { CredFree(credential.cast()) };
    result.map(Some)
}

pub fn delete(target_name: &str) -> Result<(), String> {
    let target = wide(target_name);
    if unsafe { CredDeleteW(target.as_ptr(), CRED_TYPE_GENERIC, 0) } == 0 {
        let code = unsafe { GetLastError() };
        if code != ERROR_NOT_FOUND {
            return Err(format!("Não consegui remover a credencial do Windows (código {code})."));
        }
    }
    Ok(())
}
