import { invoke } from "@tauri-apps/api/core";

export default function ClearCacheButton({log}: {log: Function}){
    const handler = async ()=>{
        log("processing the command...");
        try {
            const result = await invoke<string>("clear_cache");
            log(`${result} ✅`);
        } catch (error) {
            log(`${error} ❌`); // 👈 this was missing
        }
    }
    return(
        
        <div className="border-[##1f2023] w-[150px] h-[40px] rounded-sm bg-[#2052a8] relative overflow-hidden active:scale-[90%] duration-200">
            <button className="absolute top-0 left-0 w-[150px] h-[40px] z-10 peer" onClick={handler}>Clear Cache</button>
            <div className="w-[100px] h-[100px] border-[20px] border-[#1f2023] rounded-full absolute -top-30 -left-30 z-0 peer-hover:translate-x-[80px] peer-hover:translate-y-[70px] duration-300 ease-in-out"></div>
        </div>
    );
}