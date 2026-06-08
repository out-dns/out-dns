import { useState } from "react";
import arrow from "./../../assets/arrow.png";

export default function DnsList(){
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedDns, setSelectedDns] = useState<string>("Default DNS");

    return(
        <div className="w-[15rem] h-10 flex justify-end absolute top-10 right-12 z-20 select-none">
            <div id="network-interfaces" className="rounded-[4px] border-[1px] border-[#0000008c] px-1 text-[#ffffffa8] text-[0.9rem] drop-shadow-2xl outline-0 w-full h-7 flex items-center" onClick={()=>{setIsOpen(prev => !(isOpen))}}>
                <div className="absolute top-0 right-1 flex justify-center items-center w-5 h-full ">
                    <img className={(isOpen ? "-rotate-90 " : "rotate-0 ") + "w-4 h-4 duration-200 ease-in-out"} src={arrow} alt="arrow"/>
                </div>
                <p id="selected-interface" className="w-full h-fit">{selectedDns}</p>
            </div>
            <div className={(isOpen ? "h-52 " : "h-0 opacity-0 ") + "absolute top-8 left-0 bg-[#1f2023] rounded-md p-2 text-[#ffffffa8] overflow-y-scroll overflow-x-hidden scrollbar-thumb-transparent border-[#0000008c] border-[1px] flex flex-col gap-2 drop-shadow-2xl duration-400 ease-in-out w-[15rem]"}>
                
                <div className="relative w-full h-fit flex flex-row gap-1">
                    <div className="w-[1px] h-full bg-[#09ff008a] rounded-full"></div>
                    <p className="cursor-default hover:pl-2 hover:text-[#2052a8] duration-200 ease-in-out" onClick={()=>{setSelectedDns("Default DNS"); setIsOpen(false)}}>Default DNS</p>
                </div>

                <div className="relative w-full h-fit flex flex-row gap-1">
                    <div className="w-[1px] h-full bg-[#005eff8a] rounded-full"></div>
                    <p className="cursor-default hover:pl-2 hover:text-[#2052a8] duration-200 ease-in-out truncate min-h-fit" onClick={()=>{setSelectedDns(""); setIsOpen(false)}}></p>
                </div>

            </div>
        </div>
    );
}