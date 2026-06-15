import React, { useEffect, useState } from "react";
import arrow from "./../../assets/arrow.png";
import { invoke } from "@tauri-apps/api/core";
import { useLog } from "../../contexts/logContext";

interface SelectedDns{
    name: string;
    primary: string;
    secondary: string;
}

export default function DnsList({selectedDns, setSelectedDns}: {selectedDns: SelectedDns, setSelectedDns: React.Dispatch<React.SetStateAction<SelectedDns>>}){
    const {log} = useLog();
    const defaultDNS = {name: "Default DNS", primary: "", secondary: ""};
    interface DnsEntry{
        id: string;
        name: string;
        primary_dns: string;
        secondary_dns: string;
    }
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [dnsList, setDnsList] = useState<DnsEntry[]>([]);

    function fetchDnsList(): void{
        invoke<DnsEntry[]>("get_dns_from_db")
        .then(result => setDnsList(result))
        .catch((error)=>{
            log(`${error} ❌`);
        });

    }

    useEffect(()=>{
        fetchDnsList();
    });
    return(
        <div className="w-[15rem] h-10 flex justify-end absolute top-10 right-12 z-20 select-none">
            <div id="network-interfaces" className="rounded-[4px] border-[1px] border-[#0000008c] px-1 text-[#ffffffa8] text-[0.9rem] drop-shadow-2xl outline-0 w-full h-7 flex items-center" onClick={()=>{setIsOpen(prev => !(prev))}}>
                <div className="absolute top-0 right-1 flex justify-center items-center w-5 h-full ">
                    <img className={(isOpen ? "-rotate-90 " : "rotate-0 ") + "w-4 h-4 duration-200 ease-in-out"} src={arrow} alt="arrow"/>
                </div>
                <p id="selected-interface" className="w-full h-fit">{selectedDns.name}</p>
            </div>
            <div className={(isOpen ? "h-52 " : "h-0 opacity-0 ") + "absolute top-8 left-0 bg-[#1f2023] rounded-md p-2 text-[#ffffffa8] overflow-y-scroll overflow-x-hidden scrollbar-thumb-transparent border-[#0000008c] border-[1px] flex flex-col gap-2 drop-shadow-2xl duration-400 ease-in-out w-[15rem]"}>
                
                <div className="relative w-full h-fit flex flex-col align-baseline gap-1">
                    <div className="flex gap-2">
                        <div className="w-[1px] h-full bg-[#09ff008a] rounded-full"></div>
                        <p className="cursor-default hover:pl-2 hover:text-[#2052a8] duration-200 ease-in-out" onClick={()=>{setSelectedDns(defaultDNS); setIsOpen(false)}}>Default DNS</p>
                    </div>
                    {
                        dnsList.map((dns,k)=>{
                            return(
                            <div key={k} className="flex gap-2">
                                <div className="w-[1px] min-w-[1px] h-full bg-[#005eff8a] rounded-full"></div>
                                <p className="cursor-default ease-in-out truncate hover:pl-2 hover:text-[#2052a8] duration-200" onClick={()=>{setSelectedDns({name: dns.name, primary: dns.primary_dns, secondary: dns.secondary_dns}); setIsOpen(false)}}>{dns.name}</p>
                            </div>
                            );
                        })
                    }
                </div>

            </div>
        </div>
    );
}