import { readFileSync } from "node:fs";

const tag = process.env.GITHUB_REF_NAME ?? process.argv[2];
const match = tag?.match(/^v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)$/);
if (!match) {
  throw new Error(`Invalid release version tag: ${tag ?? "<missing>"}`);
}

const expected = match[1];
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const tauriConfig = readJson("src-tauri/tauri.conf.json");
const cargoToml = readFileSync("src-tauri/Cargo.toml", "utf8");
const cargoLock = readFileSync("src-tauri/Cargo.lock", "utf8");
const cargoTomlVersion = cargoToml.match(/^\[package\]\s*[\s\S]*?^version\s*=\s*"([^"]+)"/m)?.[1];
const cargoLockVersion = cargoLock.match(/^\[\[package\]\]\r?\nname\s*=\s*"edge-ghosty"\r?\nversion\s*=\s*"([^"]+)"/m)?.[1];

const versions = {
  "package.json": packageJson.version,
  "package-lock.json": packageLock.version,
  "package-lock.json root package": packageLock.packages?.[""]?.version,
  "src-tauri/Cargo.toml": cargoTomlVersion,
  "src-tauri/Cargo.lock": cargoLockVersion,
  "src-tauri/tauri.conf.json": tauriConfig.version,
};

const mismatches = Object.entries(versions).filter(([, version]) => version !== expected);
if (mismatches.length > 0) {
  const details = mismatches.map(([file, version]) => `${file}=${version ?? "<missing>"}`).join(", ");
  throw new Error(`Release tag v${expected} does not match app versions: ${details}`);
}

console.log(`Release tag v${expected} matches all app manifests.`);
