use std::time::Instant;
use tauri_plugin_log::log;

use hickory_resolver::{TokioAsyncResolver, config::{NameServerConfigGroup, ResolverConfig, ResolverOpts}};

use crate::{database::{db::DbState, dns_repository::{DnsEntries, delete, get, insert}}, platform::dns};

// insert new dns record
pub fn new_dns(name: &str, primary: &str, secondary: &str, state: &DbState) -> Result<(), ()>{
    insert(name, primary, secondary, &state)
}
// remove an existed dns record
pub fn remove_dns(id: i64, state: &DbState) -> Result<() ,()>{
    delete(id, &state)
}
// get all dns records
pub fn get_dns_from_db(state: &DbState) -> Result<Vec<DnsEntries>, ()>{
    get(&state)
}
// lookup the dns ip for speed testing
pub async fn lookup(ip: &str) -> Result<u128, String>{
    let dns_port = 53;
    let domain = "www.google.com.";

    let config = ResolverConfig::from_parts(
        None,
        vec![],
        NameServerConfigGroup::from_ips_clear(
            &[ip
                .trim()
                .parse()
                .map_err(|_| format!("Invalid DNS Ip Address: {}", ip.trim()))?],
            dns_port,
            true,
        ),
    );
    let mut opts = ResolverOpts::default();
    opts.cache_size = 0;
    opts.timeout = std::time::Duration::from_secs(3);

    let resolver = TokioAsyncResolver::tokio(config, opts);

    let runs: u128 = 5;
    let mut total_ms: u128 = 0;
    let mut failures: u128 = 0;

    for _i in 1..=runs {
        let start = Instant::now();
        match resolver.lookup_ip(domain).await {
            Ok(_) => {
                let ms = start.elapsed().as_millis();
                total_ms += ms;
            }
            Err(_) => {
                failures += 1;
            }
        }
    }

    if failures > 0 {
        return Err(format!("{} failure attempts of {}", failures, runs));
    } else {
        Ok(total_ms / (runs - failures))
    }
}
// flush dns cache | platform specific
pub fn flush_dns() -> Result<(), String>{
    dns().flush_dns()
}
// set dns for all interfaces or an specific interface | platform specific
pub fn set_dns(interface: &str, primary: &str, secondary: &str, state: tauri::State<DbState>) -> Result<(), String>{
    if !validate(primary, secondary) {
        return Err("invalid DNS ip address".to_string());
    }

    dns().set_dns(interface, primary, secondary, state)
    .map_err(|e| {log::error!("{}", e.to_string()); e.to_string()})

}

pub fn validate(primary: &str, secondary: &str) -> bool {
    use std::net::IpAddr;

    let p_ok = if primary.is_empty() {
        true
    } else {
        primary.parse::<IpAddr>().is_ok()
    };

    let s_ok = if secondary.is_empty() {
        true
    } else {
        secondary.parse::<IpAddr>().is_ok()
    };

    if !p_ok || !s_ok {
        return false;
    }

    true
}