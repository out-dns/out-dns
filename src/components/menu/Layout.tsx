import General from "./general/Page";
import Support from "./support/Page";
import DNS from "./dns/Page";
import React, { useState } from "react";
export default function MenuLayout({menuStatus, setMenuStatus}: {menuStatus: boolean, setMenuStatus: React.Dispatch<React.SetStateAction<boolean>>}){
    const [section, setSection] = useState('general');
    const menuHandler = ()=>{
        setMenuStatus(prev => !prev);
    }
    const renderSection = ()=>{
        switch (section) {
            case 'general':
                return(<General></General>);
            case 'dns':
                return(<DNS></DNS>);
            case 'support':
                return(<Support></Support>);
                
                default:
                    return(<Support></Support>);
        }
    }

    return(
        <div className={(menuStatus ? "pointer-events-auto" : "pointer-events-none") + " w-[100%] h-[100%] absolute top-0 left-0 z-40 flex flex-row gap-0 p-0 m-0 items-center justify-start overflow-hidden select-none text-white"}>
            <div className={(menuStatus ? "translate-x-0" : "-translate-x-full") + " bg-[#1f2023] w-[130px] min-w-[130px] h-full border-r-[1px] border-r-[#2c2c2c] duration-300 ease-in-out transition-all overflow-hidden flex flex-col justify-between text-[0.9rem]"}>
                <div className="flex flex-col gap-1 pt-1">
                    <div className="overflow-hidden relative group flex">
                        <div className={(section == "general" ? "bg-[#09ff008a] " : "bg-[#2052a8] " ) + "rounded-full w-1 h-full pointer-events-none ml-1 duration-200 ease-in-out"}></div>
                        <button className="w-full h-fit text-start p-1 duration-200 outline-0" onClick={()=>{setSection('general')}}>General</button>
                        <div className="group-hover:translate-x-3 translate-x-[120%] bg-[#005eff38] absolute w-10 h-full top-0 right-0 skew-x-12 transform-3d duration-200 ease-in-out"></div>
                    </div>
                    <div className="overflow-hidden relative group flex">
                        <div className={(section == "dns" ? "bg-[#09ff008a] " : "bg-[#2052a8] " ) + "rounded-full w-1 h-full pointer-events-none ml-1 duration-200 ease-in-out"}></div>
                        <button className="w-full h-fit text-start p-1 duration-200 outline-0" onClick={()=>{setSection('dns')}}>DNS</button>
                        <div className="group-hover:translate-x-3 translate-x-[120%] bg-[#005eff38] absolute w-10 h-full top-0 right-0 skew-x-12 transform-3d duration-200 ease-in-out"></div>
                    </div>
                </div>
                <div className="flex flex-col gap-1 pb-1">
                    <div className="overflow-hidden relative group flex">
                        <div className={(section == "support" ? "bg-[#09ff008a] " : "bg-[#2052a8] " ) + "rounded-full w-1 h-full pointer-events-none ml-1 duration-200 ease-in-out"}></div>
                        <button className="w-full h-fit text-start p-1 duration-200 outline-0" onClick={()=>{setSection('support')}}>Support❤️</button>
                        <div className="group-hover:translate-x-3 translate-x-[120%] bg-[#005eff38] absolute w-10 h-full top-0 right-0 skew-x-12 transform-3d duration-200 ease-in-out"></div>
                    </div>
                    <div className="overflow-hidden relative group flex">
                        <div className={"bg-red-800 rounded-full w-1 h-full pointer-events-none ml-1 duration-200 ease-in-out"}></div>
                        <button className="w-full h-fit text-start p-1 duration-200 outline-0" onClick={menuHandler}>Close</button>
                        <div className="group-hover:translate-x-3 translate-x-[120%] bg-[#005eff38] absolute w-10 h-full top-0 right-0 skew-x-12 transform-3d duration-200 ease-in-out"></div>
                    </div>
                </div>
            </div>

            {/* content section */}
            <div className={(menuStatus ? "translate-0" : "-translate-x-[150%]") + " bg-[#14151600] w-full h-full backdrop-blur-md transition-all duration-400 ease-in-out font-[f4]"}>
                {renderSection()}
            </div>

        </div>
    );
}