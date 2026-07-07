import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu, PredefinedMenuItem } from "@tauri-apps/api/menu";
import { TrayIcon, TrayIconEvent, TrayIconOptions} from "@tauri-apps/api/tray";
import { Window } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

type Status = "error" | "warning" | "success";
export default async function init_tray(
    log: (msg: string) => void,
    showPopup: (status: Status) => void
){  
    const icon = await defaultWindowIcon()
    const separator = await PredefinedMenuItem.new({item: "Separator"});
    const menu: Menu = await Menu.new({
        items: [
            {id: 'show', text: 'Show', action: (id)=> menu_item_event(id, log, showPopup)},
            separator,
            {id: 'set-to-dhcp', text: 'Set To DHCP', action: (id) => menu_item_event(id, log, showPopup)},
            {id: 'flush-dns', text: 'Flush DNS', action: (id) => menu_item_event(id, log, showPopup)},
            separator,
            {id: 'quit', text: 'Quit', action: (id) => menu_item_event(id, log, showPopup)},
        ],
    });

    const options: TrayIconOptions = {
        id: 'out-dns-tray',
        icon: icon ?? undefined,
        menu: menu,
        showMenuOnLeftClick: false,
        tooltip: "Out DNS",
        action: menu_event,
    };
    await TrayIcon.new(options);
}
function menu_event(e: TrayIconEvent){
    if(e.type === "DoubleClick"){
        const win = Window.getCurrent();
        win.show();
        win.setFocus();
    }
}
function menu_item_event(
    item_id: string,
    log: (msg: string) => void,
    showPopup: (status: Status) => void
){
    const win = Window.getCurrent();
    switch (item_id) {
        case 'quit':
            win.close();
            break;
        case 'show':
            win.show();
            win.unminimize();
            break;
        case 'flush-dns':
            log("processing... ⏳");
            invoke("flush_dns")
            .then(()=>{
                showPopup("success");
                log(`${"DNS flushed"} ✅`);            
            })
            .catch(()=>{
                showPopup("warning");
                log(`${"failed to flush dns"} ❌`);
            });
            break;
        case 'set-to-dhcp':
            log("processing... ⏳");
            invoke<string>("set_dns",{interface: "All Networks",primary: "",secondary: ""})
            .then(()=>{
                showPopup("success");
                log(`DNS applied for ${"All Networks"} ✅`);
            })
            .catch(()=>{
                showPopup("warning");
                log(`failed to apply DNS for ${"All Networks"} ❌`);
            });
            break;
    
        default:
            break;
    }

}