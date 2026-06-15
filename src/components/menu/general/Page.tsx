import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useLog } from "../../../contexts/logContext";

export default function General(){
    const {log} = useLog();

    const [clearCache, setClearCache] = useState(true);
    const [startup, setStartup] = useState(false);
    const [systemTrayOnMinimize, setSystemTrayOnMinimize] = useState(false);
    const [systemTrayOnClose, setSystemTrayOnClose] = useState(false);

    type configs = "clearCache" | "startUp" | "systemTrayOnMinimize" | "systemTrayOnClose";

    const editConfigs = async (config: configs)=>{
        switch (config) {
            case "clearCache":
                try {
                    await invoke("set_flush_dns_on_change", {value: clearCache});
                } catch (error) {
                    setStartup(prev => !(prev));
                    log(`${error} ❌`);
                }
                break;
                case "startUp":
                    try {
                        await invoke("set_run_on_start", {value: startup});
                    } catch (error) {
                        setStartup(prev => !(prev));
                        log(`${error} ❌`);
                    }
                    break;
                case "systemTrayOnClose":
                    try {
                        await invoke("set_close_to_tray", {value: systemTrayOnClose});
                    } catch (error) {
                        setStartup(prev => !(prev));
                        log(`${error} ❌`);
                    }
                    break;
                case "systemTrayOnMinimize":
                    try {
                        await invoke("set_minimize_to_tray", {value: systemTrayOnMinimize});
                    } catch (error) {
                        setStartup(prev => !(prev));
                        log(`${error} ❌`);
                    }
                    break;
        
            default:
                break;
        }
    }

    interface Configs{
        id: number,
        flush_dns_on_change: boolean,
        run_on_start: boolean,
        minimize_to_tray: boolean,
        close_to_tray: boolean
    }
    function fetchConfigs(){
        try {
            invoke<Configs>("get_configs")
            .then(result => {
                setClearCache(result.flush_dns_on_change);
                setStartup(result.run_on_start);
                setSystemTrayOnMinimize(result.minimize_to_tray);
                setSystemTrayOnClose(result.close_to_tray);
            });
        } catch (error) {
            log(`${error} ❌`);
        }
    }

    useEffect(()=>{
        fetchConfigs();
    });

    return(
        <div className="p-5 w-full h-full flex flex-col items-center gap-2 text-[0.9rem]"> 
        {/* clear cache */}
            <div className="w-full flex justify-between items-center bg-[#1f2023] drop-shadow-2xl p-2 rounded-full border border-[#2c2c2c] group">
                <p className="duration-200 ease-in-out">Clear cache on dns change</p>
                <label htmlFor="clearCache">
                    <div className={(clearCache ? "bg-blue-600 " : "bg-[#363636] ") + "w-10 h-5 rounded-full relative flex items-center duration-200 ease-in-out"} onClick={()=>{setClearCache(prev => !prev)}}>
                        <div className={(clearCache ? "translate-x-5 " : "translate-x-0 ") + "bg-white w-4 h-4 rounded-full absolute duration-200 ease-in-out left-0.5"}></div>
                    </div>
                    <input onChange={()=>{editConfigs("clearCache")}} type="checkbox" name="clearCache" id="clearCache" hidden defaultChecked={clearCache}/>
                </label>
            </div>
        {/* startup */}
            <div className="w-full flex justify-between items-center bg-[#1f2023] drop-shadow-2xl p-2 rounded-full border border-[#2c2c2c] group">
                <p className="duration-200 ease-in-out">Run on start</p>
                <label htmlFor="startup">
                    <div className={(startup ? "bg-blue-600 " : "bg-[#363636] ") + "w-10 h-5 rounded-full relative flex items-center duration-200 ease-in-out"} onClick={()=>{setStartup(prev => !prev)}}>
                        <div className={(startup ? "translate-x-5 " : "translate-x-0 ") + "bg-white w-4 h-4 rounded-full absolute duration-200 ease-in-out left-0.5"}></div>
                    </div>
                    <input onChange={()=>{editConfigs("startUp")}} type="checkbox" name="startup" id="startup" hidden defaultChecked={startup}/>
                </label>
            </div>
        {/* system tray on close */}
            <div className="w-full flex justify-between items-center bg-[#1f2023] drop-shadow-2xl p-2 rounded-full border border-[#2c2c2c] group">
                <p className="duration-200 ease-in-out">Stay open in system tray | close</p>
                <label htmlFor="systemTrayOnClose">
                    <div className={(systemTrayOnClose ? "bg-blue-600 " : "bg-[#363636] ") + "w-10 h-5 rounded-full relative flex items-center duration-200 ease-in-out"} onClick={()=>{setSystemTrayOnClose(prev => !prev)}}>
                        <div className={(systemTrayOnClose ? "translate-x-5 " : "translate-x-0 ") + "bg-white w-4 h-4 rounded-full absolute duration-200 ease-in-out left-0.5"}></div>
                    </div>
                    <input onChange={()=>{editConfigs("systemTrayOnClose")}} type="checkbox" name="systemTrayOnClose" id="systemTrayOnClose" hidden defaultChecked={systemTrayOnClose}/>
                </label>
            </div>
        {/* system tray on minimize */}
            <div className="w-full flex justify-between items-center bg-[#1f2023] drop-shadow-2xl p-2 rounded-full border border-[#2c2c2c] group">
                <p className="duration-200 ease-in-out">Stay open in system tray | minimize</p>
                <label htmlFor="systemTrayOnMinimize">
                    <div className={(systemTrayOnMinimize ? "bg-blue-600 " : "bg-[#363636] ") + "w-10 h-5 rounded-full relative flex items-center duration-200 ease-in-out"} onClick={()=>{setSystemTrayOnMinimize(prev => !prev)}}>
                        <div className={(systemTrayOnMinimize ? "translate-x-5 " : "translate-x-0 ") + "bg-white w-4 h-4 rounded-full absolute duration-200 ease-in-out left-0.5"}></div>
                    </div>
                    <input onChange={()=>{editConfigs("systemTrayOnMinimize")}} type="checkbox" name="systemTrayOnMinimize" id="systemTrayOnMinimize" hidden defaultChecked={systemTrayOnMinimize}/>
                </label>
            </div>
        </div>
    );
}