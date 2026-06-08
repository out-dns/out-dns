import React from "react";

export default function DnsServersInp(){

    const allowedInput = (e: React.KeyboardEvent<HTMLInputElement>)=>{
        const allowedKey = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "."]
        if(!allowedKey.includes(e.key) && !/^[0-9]$/.test(e.key)){
            e.preventDefault();
        }
    }

    return(
        <div className=" w-10/12 h-fit flex flex-row justify-around items-center text-white absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <input className="w-56 h-14 outline-none rounded-md bg-[#1f2023] border border[1px] border-[#0000008c] focus:border-[#2052a8] duration-200 ease-in-out px-2 py-1 text-center drop-shadow-2xl" accept="[0-9]" type="text" placeholder="primary: 0.0.0.0" onKeyDown={allowedInput} maxLength={15}/>
            <input className="w-56 h-14 outline-none rounded-md bg-[#1f2023] border border[1px] border-[#0000008c] focus:border-[#2052a8] duration-200 ease-in-out px-2 py-1 text-center drop-shadow-2xl" accept="[0-9]" type="text" placeholder="secondary: 0.0.0.0" onKeyDown={allowedInput} maxLength={15}/>
        </div>
    );
}