import { invoke } from "@tauri-apps/api/core";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import { useLog } from "./logContext";

export interface Configs{
    id: number,
    flush_dns_on_change: boolean,
    autostart: boolean,
    minimize_to_tray: boolean,
    close_to_tray: boolean
}

type ConfigContextType = {
    configs: Configs,
    setConfigs: Dispatch<SetStateAction<Configs>>,
    refetchConfigs: () => void,
}

export function ConfigProvider({children}: {children: ReactNode}){
    const {log} = useLog();
    const [configs, setConfigs] = useState<Configs>({
        id: 1,
        flush_dns_on_change: true,
        autostart: false,
        minimize_to_tray: false,
        close_to_tray: false,
    });
    
    const refetchConfigs = ()=>{
        invoke<Configs>("get_configs")
        .then((result)=>{
            setConfigs(result);
        })
        .catch((e)=> {
            log(`${e} ❌`);
        });
    }

    useEffect(()=>{
        refetchConfigs();
    },[]);

    return(
        <ConfigContext.Provider value={{ configs,setConfigs,refetchConfigs }}>
            {children}
        </ConfigContext.Provider>
    );
}

const ConfigContext = createContext<ConfigContextType>({
    configs: {
        id: 1,
        flush_dns_on_change: true,
        autostart: false,
        minimize_to_tray: false,
        close_to_tray: false,
    },
    setConfigs: () => {},
    refetchConfigs: () => {},
});

export function useConfig(){
  return useContext(ConfigContext);  
}