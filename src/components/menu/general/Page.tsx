import { invoke } from "@tauri-apps/api/core";
import { useLog } from "../../../contexts/logContext";
import { useConfig } from "../../../contexts/configsContext";

export default function General({section}: {section: string}){
    const {log} = useLog();
    const {configs, setConfigs, refetchConfigs} = useConfig();

    type configs = "clearCache" | "autostart" | "systemTrayOnMinimize" | "systemTrayOnClose";

    const editConfigs = (config: configs)=>{
        switch (config) {
            case "clearCache":
                invoke("toggle_flush_dns_on_change", {value: !configs.flush_dns_on_change})
                .then(()=>{
                    setConfigs(prev => ({
                        ...prev,
                        flush_dns_on_change: !prev.flush_dns_on_change
                    }));
                })
                .catch((error)=>{
                    log(`${error} ❌`);
                });
                break;
            case "autostart":
                invoke("toggle_autostart", {value: !configs.autostart})
                .then(()=>{
                    setConfigs(prev => ({
                        ...prev,
                        autostart: !prev.autostart
                    }));                
                })
                .catch((error)=>{
                    log(`${error} ❌`);
                });
                console.log(configs);   
                break;
            case "systemTrayOnClose":
                invoke("toggle_close_to_tray", {value: !configs.close_to_tray})
                .then(()=>{
                    setConfigs(prev => ({
                        ...prev,
                        close_to_tray: !prev.close_to_tray
                    }));
                })
                .catch((error)=>{
                    log(`${error} ❌`);
                });
                break;
            case "systemTrayOnMinimize":
                invoke("toggle_minimize_to_tray", {value: !configs.minimize_to_tray})
                .then(()=>{
                    setConfigs(prev => ({
                        ...prev,
                        minimize_to_tray: !prev.minimize_to_tray
                    }));
                })
                .catch((error)=>{
                    log(`${error} ❌`);
                });
                break;
            default:
                break;
        }
        refetchConfigs();
    }


    function open_log_folder(){
        invoke("open_log_folder")
        .catch((error)=>{
            log(`${error} ❌`);
        });
    }

    return(
        <div className={(section == "general" ? "" : "translate-x-full opacity-0 " ) + "absolute top-0 left-0 duration-400 p-5 w-full h-full flex flex-col items-center gap-2 text-[0.9rem]"}> 
        {/* clear cache */}
            <div className="w-full flex justify-between items-center bg-[#1f2023] drop-shadow-2xl p-2 rounded-full border border-[#2c2c2c] group">
                <p className="duration-200 ease-in-out">Clear cache on dns change</p>
                <label htmlFor="clearCache">
                    <div className={(configs.flush_dns_on_change ? "bg-blue-600 " : "bg-[#363636] ") + "w-10 h-5 rounded-full relative flex items-center duration-200 ease-in-out"}>
                        <div className={(configs.flush_dns_on_change ? "translate-x-5 " : "translate-x-0 ") + "bg-white w-4 h-4 rounded-full absolute duration-200 ease-in-out left-0.5"}></div>
                    </div>
                    <input onChange={()=>{editConfigs("clearCache")}} type="checkbox" name="clearCache" id="clearCache" hidden defaultChecked={configs.flush_dns_on_change}/>
                </label>
            </div>
        {/* autostart */}
            <div className="w-full flex justify-between items-center bg-[#1f2023] drop-shadow-2xl p-2 rounded-full border border-[#2c2c2c] group">
                <p className="duration-200 ease-in-out">Run on start</p>
                <label htmlFor="autostart">
                    <div className={(configs.autostart ? "bg-blue-600 " : "bg-[#363636] ") + "w-10 h-5 rounded-full relative flex items-center duration-200 ease-in-out"}>
                        <div className={(configs.autostart ? "translate-x-5 " : "translate-x-0 ") + "bg-white w-4 h-4 rounded-full absolute duration-200 ease-in-out left-0.5"}></div>
                    </div>
                    <input onChange={()=>{editConfigs("autostart")}} type="checkbox" name="autostart" id="autostart" hidden defaultChecked={configs.autostart}/>
                </label>
            </div>
        {/* system tray on close */}
            <div className="w-full flex justify-between items-center bg-[#1f2023] drop-shadow-2xl p-2 rounded-full border border-[#2c2c2c] group">
                <p className="duration-200 ease-in-out">Stay open in system tray | close</p>
                <label htmlFor="systemTrayOnClose">
                    <div className={(configs.close_to_tray ? "bg-blue-600 " : "bg-[#363636] ") + "w-10 h-5 rounded-full relative flex items-center duration-200 ease-in-out"}>
                        <div className={(configs.close_to_tray ? "translate-x-5 " : "translate-x-0 ") + "bg-white w-4 h-4 rounded-full absolute duration-200 ease-in-out left-0.5"}></div>
                    </div>
                    <input onChange={()=>{editConfigs("systemTrayOnClose")}} type="checkbox" name="systemTrayOnClose" id="systemTrayOnClose" hidden defaultChecked={configs.close_to_tray}/>
                </label>
            </div>
        {/* system tray on minimize */}
            <div className="w-full flex justify-between items-center bg-[#1f2023] drop-shadow-2xl p-2 rounded-full border border-[#2c2c2c] group">
                <p className="duration-200 ease-in-out">Stay open in system tray | minimize</p>
                <label htmlFor="systemTrayOnMinimize">
                    <div className={(configs.minimize_to_tray ? "bg-blue-600 " : "bg-[#363636] ") + "w-10 h-5 rounded-full relative flex items-center duration-200 ease-in-out"}>
                        <div className={(configs.minimize_to_tray ? "translate-x-5 " : "translate-x-0 ") + "bg-white w-4 h-4 rounded-full absolute duration-200 ease-in-out left-0.5"}></div>
                    </div>
                    <input onChange={()=>{editConfigs("systemTrayOnMinimize")}} type="checkbox" name="systemTrayOnMinimize" id="systemTrayOnMinimize" hidden defaultChecked={configs.minimize_to_tray}/>
                </label>
            </div>
            <button onClick={open_log_folder} className="w-40 h-10 bg-yellow-400 text-[#292929] rounded-full drop-shadow-2xl duration-100 ease-in-out group">
                <div className="w-full h-full absolute overflow-hidden rounded-full backdrop-blur top-1 left-2 group-hover:top-0 group-hover:left-0 duration-200 border border-[#8181814f]">
                    <div className="w-full h-full bg-[#ffee007d] blur-3xl"></div>
                </div>
                <span className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-full">Open Log Folder</span>
            </button>
        </div>
    );
}