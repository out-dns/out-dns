<div align="center">

<img src="public/icon.png" alt="OutDNS logo" width="96" height="96">

# OutDNS

**A fast, native DNS management utility for Windows.**

Switch DNS servers across one or all network adapters in a click, benchmark resolver latency, and keep a saved list of your go-to DNS providers — all from a lightweight, frameless desktop app.

[![Platform](https://img.shields.io/badge/platform-Windows-0078D6)](#requirements)
[![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri%20v2-24C8DB)](https://tauri.app)
[![Rust](https://img.shields.io/badge/backend-Rust-CE422B)](https://www.rust-lang.org/)
[![React](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61DAFB)](https://react.dev)
[![License](https://img.shields.io/badge/license-Source--Available-lightgrey)](./LICENSE)

</div>

---

## Preview

> _Screenshots coming soon._

<!--
Add screenshots/GIFs here once available, e.g.:

<p align="center">
  <img src="docs/screenshot-main.png" width="600" alt="OutDNS main window">
</p>
<p align="center">
  <img src="docs/screenshot-tray.png" width="300" alt="OutDNS system tray menu">
</p>
-->

## Why OutDNS?

Most built-in DNS switching tools mean digging through `ncpa.cpl`, clicking through adapter properties dialogs, or running `netsh` by hand. OutDNS wraps that into one window: pick an adapter (or all of them at once), pick a DNS provider, hit **Set DNS**.

Under the hood, it doesn't shell out to `netsh` for the actual DNS write — it calls the native Windows `SetInterfaceDnsSettings` API directly via the [`windows`](https://crates.io/crates/windows) crate. No subprocess spawn, no console flash, no `netsh.exe` startup overhead — just a direct call into `iphlpapi.dll`.

## Features

- **Set DNS per adapter or for all adapters at once** — select a single network interface or apply to every detected interface in one action, using the native `SetInterfaceDnsSettings` Win32 API (not `netsh`/`wmic`).
- **Revert to DHCP** — clear static DNS and hand resolution back to your router/ISP with one click, from the main window or the tray menu.
- **Saved DNS profiles** — keep a list of named DNS pairs (Cloudflare and Google are seeded by default) backed by a local SQLite database, with add/remove support from the UI.
- **DNS resolver benchmarking** — measure average query latency for a given DNS server against a live lookup, to compare resolvers before committing to one.
- **System tray integration** — runs from the tray with a right-click menu (`Set To DHCP`, `Flush DNS`, `Quit`) and restores the window on double-click.
- **Flush DNS cache** — trigger `ipconfig /flushdns` manually, or automatically after every DNS change (toggle in settings).
- **Run at startup** — registers a Task Scheduler entry (`schtasks`) that launches OutDNS at logon with highest privileges, working around the elevation/Run-key conflict that `requireAdministrator` apps normally hit with standard autostart mechanisms.
- **Minimize/close to tray** — independently configurable: minimizing or closing the window can either act normally or hide to the tray instead, enforced via the custom titlebar.
- **Custom frameless titlebar** — native window chrome is disabled in favor of an in-app drag region with custom minimize/close buttons.
- **Persistent settings** — all toggles (flush-on-change, autostart, tray behavior) are stored in SQLite and restored on launch.
- **Local activity log** — an in-app log pane shows what the app is doing (DNS applied, flush results, errors) in real time.
- **Crypto donation support** — an in-app Support page with a TRC20 (TRON) wallet address for anyone who wants to support development.

## How DNS is actually set

This was a deliberate, iterative design choice, not the first approach tried:

| Approach | Status |
|---|---|
| `netsh` subprocess calls | Dropped — measured 6 to 10 seconds per call on real hardware due to `netsh.exe`'s own startup/helper-DLL overhead (independent of process-spawn batching) |
| `wmic` | Dropped — deprecated and removed starting with Windows 11 24H2 |
| Registry writes | Dropped — doesn't reliably trigger the network stack to pick up changes without extra signaling |
| WMI | Dropped — in favor of a lower-level option |
| **`SetInterfaceDnsSettings` (native Win32 API)** | **Current implementation** — sub-millisecond to a few milliseconds per interface, no process spawn at all |

The native path requires resolving a network interface's **GUID** from its friendly name (e.g. `"Wi-Fi"`), which OutDNS does via `GetAdaptersAddresses`, followed by `CLSIDFromString` to parse the adapter's GUID string into a `windows::core::GUID`. The DNS server list itself is written as a single `DNS_INTERFACE_SETTINGS` struct with the `DNS_SETTING_NAMESERVER` flag set — omitting that flag causes the call to silently succeed without changing anything, which is a known and easy-to-miss gotcha with this API.

When DNS is applied to **All Networks**, each interface is attempted independently: if one adapter's GUID can't be resolved or its DNS write fails (e.g. a disabled or virtual adapter), that interface is skipped and logged, while the rest continue — a single bad adapter doesn't block the others.

## Tech stack

- **Shell:** [Tauri v2](https://tauri.app) — Rust backend, native webview frontend, single ~few-MB installer.
- **Backend:** Rust — `windows` crate for native Win32 DNS APIs, `rusqlite` (bundled SQLite) for persistence, `hickory-resolver` for DNS resolution benchmarking, `network-interface` for adapter enumeration, `is_elevated` for privilege checks, `tauri-plugin-log` for file-based logging.
- **Frontend:** React 19 + TypeScript, Tailwind CSS v4, built with Vite.
- **Persistence:** a local SQLite database (`out-dns.db` in the app's data directory) storing saved DNS profiles and app settings.

## Requirements

- **Windows only.** The DNS-setting logic depends on Win32 APIs (`iphlpapi.dll`) that have no equivalent code path for other platforms in this codebase.
- **Administrator privileges.** OutDNS's manifest requests `requireAdministrator`, since modifying network adapter DNS settings requires elevation. The app will prompt via UAC on launch.

## Getting started (development)

### Prerequisites

- [Node.js](https://nodejs.org/) (for the frontend/Vite/npm tooling)
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain, MSVC target on Windows)
- [Tauri CLI](https://tauri.app/start/prerequisites/) and its platform prerequisites (WebView2, Visual Studio C++ Build Tools on Windows)

### Setup

```bash
git clone https://github.com/amirithm-dev/out-dns.git
cd out-dns
npm install
```

### Run in development

```bash
npm run tauri dev
```

This starts the Vite dev server and launches the Tauri window pointed at it, with hot reload for the frontend.

### Build a release binary

```bash
npm run tauri build
```

The bundled installer/executable will be output under `src-tauri/target/release/bundle/`.

> **Note:** Because the app requests `requireAdministrator` via its manifest, you'll be prompted for elevation both when running in dev mode and when launching the built binary.

## Project structure

```
out-dns/
├── src/                          # React + TypeScript frontend
│   ├── components/
│   │   ├── buttons/              # Set DNS, Clear Cache, hamburger menu buttons
│   │   ├── comboBox/              # Network interface & saved DNS dropdowns
│   │   ├── input/                # Primary/secondary DNS input fields
│   │   ├── menu/                  # Slide-out settings menu (General / DNS / Support tabs)
│   │   └── titlebar/              # Custom frameless window titlebar
│   ├── contexts/                  # React context for in-app logs & status popups
│   └── lib/tray.ts                # Tauri tray icon, menu, and click-event wiring
│
├── src-tauri/                     # Rust backend (Tauri)
│   ├── src/
│   │   ├── handlers/
│   │   │   ├── dns.rs              # set_dns, flush_dns, resolve (benchmark), DNS CRUD
│   │   │   ├── interface.rs        # Adapter enumeration + name→GUID resolution
│   │   │   ├── config.rs           # App settings (autostart, tray behavior, etc.)
│   │   │   └── database.rs         # SQLite connection & schema setup
│   │   ├── lib.rs                  # Tauri app builder, command registration
│   │   └── main.rs                 # Entry point
│   ├── app.manifest                # Windows manifest (requireAdministrator, Common Controls v6)
│   ├── build.rs                    # Embeds app.manifest into the compiled binary
│   └── tauri.conf.json             # Window, bundle, and identifier configuration
│
└── LICENSE
```

## Known limitations

- Windows-only — no macOS or Linux DNS-setting implementation exists yet (the `flush_dns` command does have cross-platform branches for macOS/Linux, but adapter DNS setting does not).
- Requires administrator privileges to run at all, since there's currently no split between privileged DNS-mutation actions and the rest of the app.

## Support the project

If OutDNS is useful to you, you can support development via the in-app **Support** tab, or directly:

- **USDT (TRC20 / TRON):** see the Support tab in-app for the current wallet address.

## License

This project is **source-available**, not open-source: you're welcome to read the code and learn from it, but reuse, redistribution, and rebranding are not permitted without explicit permission. See [LICENSE](./LICENSE) for the full terms.

## Author

Built by [amirithm-dev](https://github.com/amirithm-dev).
