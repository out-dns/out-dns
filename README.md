<p align="center">
  <img src="public/icon.png" alt="OutDNS logo" width="96" />
</p>

# OutDNS

**A fast, native DNS management utility for Windows and Linux.**

Switch DNS servers across one or all network interfaces in a click, benchmark resolver latency, and keep a saved list of your go-to DNS providers — all from a lightweight, frameless desktop app.

🌐 **Website:** [outdns.ir](https://outdns.ir)

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-0078D6)
[![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri%20v2-24C8DB)](https://tauri.app)
[![Rust](https://img.shields.io/badge/backend-Rust-CE422B)](https://www.rust-lang.org/)
[![React](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61DAFB)](https://react.dev)
[![License](https://img.shields.io/badge/license-Source--Available-lightgrey)](LICENCE)

---

## Preview

> *Screenshots coming soon.*

## Why OutDNS?

Most built-in DNS switching tools mean digging through `ncpa.cpl` on Windows or fiddling with NetworkManager's settings dialog on Linux. OutDNS wraps that into one window: pick an interface (or all of them at once), pick a DNS provider, hit **Set DNS**.

- **On Windows**, it doesn't shell out to `netsh` for the actual DNS write — it calls the native `SetInterfaceDnsSettings` API directly via the [`windows`](https://crates.io/crates/windows) crate. No subprocess spawn, no console flash.
- **On Linux**, it drives `nmcli` to update DNS on a per-connection basis through NetworkManager, then re-applies the connection so the change takes effect immediately.

## Features

- **Set DNS per interface or for all interfaces at once** — select a single network interface or apply to every detected interface in one action.
- **Revert to DHCP** — clear static DNS and hand resolution back to your router/ISP with one click.
- **Saved DNS profiles** — keep a list of named DNS pairs (Cloudflare and Google are seeded by default) backed by a local SQLite database, with add/remove support from the UI.
- **DNS resolver benchmarking** — measure average query latency for a given DNS server against a live lookup, to compare resolvers before committing to one.
- **System tray integration** — runs from the tray with a right-click menu and restores the window on double-click. *(Windows)*
- **Flush DNS cache** — clear the resolver cache manually or automatically after every DNS change (toggle in settings).
- **Run at startup** — launches OutDNS at logon. *(Windows)*
- **Minimize/close to tray** — independently configurable, enforced via the custom titlebar. *(Windows)*
- **Custom frameless titlebar** — native window chrome is disabled in favor of an in-app drag region with custom minimize/close buttons.
- **Persistent settings** — all toggles are stored in SQLite and restored on launch.
- **Local activity log** — an in-app log pane shows what the app is doing (DNS applied, flush results, errors) in real time.
- **Crypto donation support** — an in-app Support page with a wallet address for anyone who wants to support development.

## How DNS is actually set

### Windows

This was a deliberate, iterative design choice, not the first approach tried:

| Approach | Status |
| --- | --- |
| `netsh` subprocess calls | Dropped — measured 6 to 10 seconds per call on real hardware due to `netsh.exe`'s own startup/helper-DLL overhead |
| `wmic` | Dropped — deprecated and removed starting with Windows 11 24H2 |
| Registry writes | Dropped — doesn't reliably trigger the network stack to pick up changes without extra signaling |
| WMI | Dropped — in favor of a lower-level option |
| **`SetInterfaceDnsSettings` (native Win32 API)** | **Current implementation** — sub-millisecond to a few milliseconds per interface, no process spawn at all |

The native path requires resolving a network interface's **GUID** from its friendly name (e.g. `"Wi-Fi"`) via `GetAdaptersAddresses`, then parsing that GUID string with `CLSIDFromString`. The DNS server list is written as a `DNS_INTERFACE_SETTINGS` struct with the `DNS_SETTING_NAMESERVER` flag set — omitting that flag causes the call to silently succeed without changing anything, a known and easy-to-miss gotcha with this API.

> **A note on Windows version support:** `SetInterfaceDnsSettings` and the `DNS_INTERFACE_SETTINGS` struct it relies on were introduced with **Windows 10, version 1903 (build 18362)**. This means OutDNS's native DNS path does **not** work on Windows 7, Windows 8/8.1, or early Windows 10 builds prior to 1903 — only reasonably current Windows 10 and Windows 11 installations are supported.

When DNS is applied to **All Interfaces**, each adapter is attempted independently: if one adapter's GUID can't be resolved or its DNS write fails (e.g. a disabled or virtual adapter), that interface is skipped and logged, while the rest continue.

### Linux

Rather than talking to NetworkManager directly over D-Bus (`zbus`), OutDNS shells out to **`nmcli`**, NetworkManager's own CLI. This was a deliberate simplicity trade-off: driving `nmcli` avoids hand-rolling D-Bus proxy bindings and interface-detection logic, at the cost of a small subprocess-spawn overhead per call.

- Interfaces are enumerated and matched to their NetworkManager connection via `nmcli`, checking each connection's `GENERAL.STATE`/`Managed` status rather than reading `/etc/resolv.conf` (which reflects the resolved result, not per-interface configuration, and is frequently a symlink managed by `systemd-resolved`).
- Setting DNS updates the relevant connection's `ipv4.dns` / `ipv6.dns` properties and then brings the connection down and up (or reapplies it) so the change takes effect without a full network restart.
- Reverting to DHCP clears the static DNS properties on the connection, handing resolution back to the DHCP-provided servers.
- Because changing another user's system-wide NetworkManager connection is a privileged action, `nmcli` triggers a **PolicyKit (polkit) authentication prompt** the first time a connection is modified in a session — you'll be asked for your password via your desktop's polkit agent, not via `sudo` in a terminal. Exact behavior (whether you're prompted at all, and how often) depends on your distro's polkit rules for `org.freedesktop.NetworkManager.settings.modify.system`.

**Supported distros:** any Linux distribution using **NetworkManager** as its network backend (Ubuntu, Fedora, Pop!_OS, Debian with NetworkManager, openSUSE, etc.). Distros that manage networking with `systemd-networkd`, `netplan` in non-NetworkManager mode, or `ifupdown` directly are not supported, since there's no `nmcli`/NetworkManager connection to target.

## Tech stack

- **Shell:** [Tauri v2](https://tauri.app) — Rust backend, native webview frontend, single installer per platform.
- **Backend:** Rust — `windows` crate for native Win32 DNS APIs on Windows, `nmcli` subprocess calls on Linux, `rusqlite` (bundled SQLite) for persistence, `hickory-resolver` for DNS resolution benchmarking, `tauri-plugin-log` for file-based logging.
- **Frontend:** React 19 + TypeScript, Tailwind CSS v4, built with Vite.
- **Persistence:** a local SQLite database (`out-dns.db` in the app's data directory) storing saved DNS profiles and app settings.

## Requirements

### Windows
- Windows 10 (version 1903 / build 18362) or later, or Windows 11.
- Administrator privileges — OutDNS's manifest requests `requireAdministrator`, since modifying adapter DNS settings requires elevation. The app will prompt via UAC on launch.

### Linux
- A distribution using **NetworkManager** with `nmcli` available on `PATH`.
- A polkit agent running in your desktop session (standard on GNOME, KDE, and most desktop environments) so the authentication prompt can appear when DNS settings are changed.

## Getting started (development)

### Prerequisites

- [Node.js](https://nodejs.org/) (for the frontend/Vite/npm tooling)
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain — MSVC target on Windows)
- [Tauri CLI](https://tauri.app/start/prerequisites/) and its platform prerequisites:
  - **Windows:** WebView2, Visual Studio C++ Build Tools
  - **Linux:** WebKitGTK and related system packages (see the [Tauri Linux prerequisites](https://tauri.app/start/prerequisites/#linux)), plus NetworkManager/`nmcli` installed and running

### Setup

```
git clone https://github.com/amirithm-dev/out-dns.git
cd out-dns
npm install
```

### Run in development

```
npm run tauri dev
```

This starts the Vite dev server and launches the Tauri window pointed at it, with hot reload for the frontend.

### Build a release binary

```
npm run tauri build
```

The bundled installer/executable will be output under `src-tauri/target/release/bundle/`.

> **Note:** On Windows, because the app requests `requireAdministrator` via its manifest, you'll be prompted for elevation both when running in dev mode and when launching the built binary. On Linux, expect a polkit password prompt the first time a DNS change is applied in a session.

## Project structure

```
out-dns/
├── src/                          # React + TypeScript frontend
│   ├── components/
│   │   ├── buttons/               # Set DNS, Clear Cache, hamburger menu buttons
│   │   ├── comboBox/               # Network interface & saved DNS dropdowns
│   │   ├── input/                  # Primary/secondary DNS input fields
│   │   ├── menu/                   # Slide-out settings menu (General / DNS / Support tabs)
│   │   └── titlebar/                # Custom frameless window titlebar
│   ├── contexts/                    # React context for in-app logs & status popups
│   └── lib/tray.ts                  # Tauri tray icon, menu, and click-event wiring
│
├── src-tauri/                     # Rust backend (Tauri)
│   ├── src/
│   │   ├── platform/
│   │   │   ├── windows.rs           # Thin Win32 API wrappers (SetInterfaceDnsSettings, adapter enumeration)
│   │   │   └── linux.rs             # Thin nmcli wrappers, returning raw `Result<Output, std::io::Error>`
│   │   ├── services/
│   │   │   └── dns_service.rs       # Platform-agnostic business logic; interprets platform output
│   │   ├── handlers/
│   │   │   ├── dns.rs                # Tauri command handlers — thin wrappers around dns_service
│   │   │   ├── interface.rs           # Interface enumeration commands
│   │   │   ├── config.rs              # App settings (autostart, tray behavior, etc.)
│   │   │   └── database.rs            # SQLite connection & schema setup
│   │   ├── lib.rs                    # Tauri app builder, command registration
│   │   └── main.rs                   # Entry point
│   ├── app.manifest                 # Windows manifest (requireAdministrator, Common Controls v6)
│   ├── build.rs                     # Embeds app.manifest into the compiled Windows binary
│   └── tauri.conf.json              # Window, bundle, and identifier configuration
│
└── LICENCE
```

## Known limitations

- No macOS DNS-setting implementation exists yet.
- On Windows, requires administrator privileges to run at all, since there's currently no split between privileged DNS-mutation actions and the rest of the app.
- On Linux, distros without NetworkManager (e.g. pure `systemd-networkd` or `netplan`-only setups) aren't supported.

## Support the project

If OutDNS is useful to you, you can support development via the in-app **Support** tab, or directly:

- **USDT (TRC20 / TRON):** see the Support tab in-app for the current wallet address.

## License

This project is **source-available**, not open-source: you're welcome to read the code and learn from it, but reuse, redistribution, and rebranding are not permitted without explicit permission. See [LICENCE](LICENCE) for the full terms.

## Author

Built by [amirithm-dev](https://github.com/amirithm-dev).

Website: [outdns.ir](https://outdns.ir)
