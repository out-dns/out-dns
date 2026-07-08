import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useLog } from "../../../contexts/logContext";

import remove from './../../../assets/remove.png'
import { usePopup } from "../../../contexts/popupContext";

export default function DNS({section}: {section: string}){
    const { showPopup } = usePopup();
    const {log} = useLog();
    interface DnsEntry{
        id: string;
        name: string;
        primary_dns: string;
        secondary_dns: string;
    }
    const [dnsList, setDnsList] = useState<DnsEntry[]>([]);

    const [dnsName, setDnsName] = useState<string>("");
    const [firstAddress, setFirstAddress] = useState<string>("");
    const [secondAddress, setSecondAddress] = useState<string>("");

    function insert(name: string, primary: string, secondary: string){
        if(name.length < 1 || primary.length < 7 || secondary.length < 7 ){
            log("invalid DNS data ❌");
            return showPopup("warning");
        }
        
        invoke<string>("new_dns",{name: name, primary: primary, secondary: secondary})
        .then(result => {
            showPopup("success");
            log(`${result} ✅`);
            setDnsName("");
            setFirstAddress("");
            setSecondAddress("");
        })
        .catch(()=>{
            showPopup("warning");
            log(`failed to insert DNS ❌`);
        });
    }

    function fetchDns() {
        invoke<DnsEntry[]>("get_dns_from_db")
        .then(result => {
            setDnsList(result);
        }).catch(()=>{
            log(`failed to fetch DNS list ❌`);
        });

    }
    useEffect(()=>{
        fetchDns();
    });

    function removeDns(id: number) {
        invoke<string>("remove_dns", {id: id})
        .then(()=>{
            fetchDns();
        })
        .catch(()=>{
            log(`failed to remove DNS ❌`);
        });
    }
    
    return(
        <div className={(section == "dns" ? "" : "translate-x-full opacity-0 ") + "absolute top-0 left-0 duration-300 w-full h-full flex flex-col items-center p-5 gap-4"}>
            <div className="w-full max-w-100 h-36 rounded-md bg-[#1f2023] border border-[#2c2c2c] drop-shadow-2xl overflow-hidden relative overflow-x-hidden overflow-y-scroll scrollbar-none">
                {dnsList.map((dns,i)=>{
                    return(
                        <div key={i} className="w-full h-fit flex flex-col truncate border-b border-b-[#00000041] p-1 group gap-2">
                            <div className="flex gap-2 justify-center truncate overflow-hidden relative">
                                <div className="truncate flex gap-2 justify-center absolute rounded backdrop-blur px-2 -translate-y-full scale-0 group-hover:translate-0 group-hover:scale-100 duration-200 ease-in-out border border-[#8181812c]">
                                    <p className="truncate w-fit text-[0.9rem]">{dns.name}</p>
                                </div>
                                <p className="w-full h-full truncate text-right font-[f2] text-[1rem]">{dns.primary_dns}</p>
                                <span className="text-[#0000008c] font-mono">|</span>
                                <p className="w-full h-full truncate text-left font-[f2] text-[1rem]">{dns.secondary_dns}</p>
                            </div>
                            <div className="w-1/12 flex justify-center items-center translate-x-7 group-hover:translate-0 group-hover:rotate-0 duration-200 ease-in-out fixed right-0">
                                <button onClick={(e)=>{removeDns(parseInt(e.currentTarget.value))}} value={dns.id} className="rotate-180 hover:scale-95"><img className="max-w-[1.4rem] max-h-[1.4rem]" src={remove} alt="remove" /></button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex w-full gap-2">
                <div className="w-full flex items-center gap-2">
                    <div className="flex gap-2 flex-col justify-center items-center font-[f1]">
                        <input value={dnsName} onChange={e => {setDnsName(e.currentTarget.value)}}          className="tracking-widest outline-none bg-[#1f2023] rounded-md py-2 px-5 text-center border border-[#0000008c] focus:border-[#2052a8] duration-200 max-w-52 min-w-52 font-[f3]" type="text" name="" id="" placeholder="DNS name" maxLength={30}/>
                        <input value={firstAddress} onChange={e => (setFirstAddress(e.target.value))}       className="tracking-widest outline-none bg-[#1f2023] rounded-md py-2 px-5 text-center border border-[#0000008c] focus:border-[#2052a8] duration-200 max-w-52 min-w-52" type="text" name="" id="" placeholder="primary: 0.0.0.0" maxLength={15}/>
                        <input value={secondAddress} onChange={e => (setSecondAddress(e.target.value))}     className="tracking-widest outline-none bg-[#1f2023] rounded-md py-2 px-5 text-center border border-[#0000008c] focus:border-[#2052a8] duration-200 max-w-52 min-w-52" type="text" name="" id="" placeholder="secondary: 0.0.0.0" maxLength={15}/>
                    </div>
                </div>
                <div className="flex flex-col justify-end gap-2 font-[f1]">
                    <button onClick={()=>{insert(dnsName, firstAddress, secondAddress)}} className="w-36 h-11 bg-[#2052a8] rounded-md text-center drop-shadow-2xl border border-[#1f20239f] overflow-hidden group">
                        <div className="absolute -top-5 -left-5 translate-y-full scale-0 translate-x-40 group-hover:scale-100 group-hover:translate-0 border-4 border-black bg-transparent rounded-full w-15 h-15 blur-xs duration-400"></div>
                        <span>Add</span>
                    </button>
                    <button onClick={()=>{setDnsName(""); setFirstAddress(""); setSecondAddress("")}} className="w-36 h-11 bg-[#2052a8] rounded-md text-center drop-shadow-2xl border border-[#1f20239f] overflow-hidden group">
                        <div className="absolute -top-5 -left-5 translate-y-full scale-0 translate-x-40 group-hover:scale-100 group-hover:translate-0 border-4 border-black bg-transparent rounded-full w-15 h-15 blur-xs duration-400"></div>
                        <span>clear</span>
                    </button>
                </div>
            </div>

        </div>
    );
}