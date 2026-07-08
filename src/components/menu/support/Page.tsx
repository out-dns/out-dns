import { openUrl } from '@tauri-apps/plugin-opener';
import ReymitLogo from "./../../../assets/reymit.webp"
import TetherLogo from "./../../../assets/tether.png";
import Github from "./../../../assets/github.png";
import Tron from "./../../../assets/Tron.png";

import { useState } from 'react';

export default function Support({section}: {section: string}){
    const walletAddress = "TWKNGyaEP9tbt7M91QL7xUrLrNsMQsXBzB";
    const [isCopied, setIsCopied] = useState(false);
    const writeToClipboard = (content: string)=>{
        navigator.clipboard.writeText(content);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 1000);
    }

    return(
        <div className={(section == "support" ? "" : "translate-x-full opacity-0 ") + "absolute top-0 left-0 duration-300 w-full h-full flex justify-between items-center flex-col p-5 gap-2"}>
            <div className="w-12/12 p-1.5 bg-[#1f2023] rounded-sm drop-shadow-2xl border border-[#2c2c2c] flex flex-col gap-2">
                <p className="text-center">❤️ made with love and passion ❤️</p>
                <div className="w-full overflow-hidden flex justify-center">
                    <img onClick={async()=>{openUrl("https://github.com/amirithm-dev/out-dns")}} src={Github} alt="github" className="w-fit max-w-44 h-14 bg-[#fcfcfc] rounded-full hover:scale-95 duration-200 ease-in-out cursor-pointer"/>
                </div>
                <p className="text-center">⭐ be sure to give star ⭐</p>
            </div>
            <div className="w-full bg-[#1f2023] p-1 rounded-md flex justify-around items-center text-[0.85rem] relative group overflow-hidden border border-[#2c2c2c]">
                <p className="opacity-70">Wallet Address:</p>
                <p>{walletAddress}</p>
                <button onClick={()=>{writeToClipboard(walletAddress)}} className="absolute left-0 top-0 w-full h-full backdrop-blur-xl rounded-md text-[0.9rem] opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none duration-300 ease-in-out">click to copy</button>
            </div>
            <div className="flex gap-4 w-full items-center justify-center text-[0.9rem]">
                <div onClick={async ()=>{writeToClipboard(walletAddress)}} className="bg-[#1f2023] rounded-md w-fit p-2 items-center border border-[#2c2c2c] drop-shadow-2xl flex gap-4 duration-300 ease-in-out hover:-translate-y-0.5 cursor-pointer">
                    <img src={TetherLogo} alt="tether" className="w-10 h-10 aspect-auto duration-200 hover:scale-[90%]"/>
                    <p className="self-center">donate via Tether</p>
                    <img src={Tron} alt="Tron" className="w-4 h-4 absolute right-1 bottom-1"/>
                </div>
                <div onClick={async ()=>{await openUrl("https://reymit.ir/amirithm")}} className="bg-[#1f2023] rounded-md w-fit p-2 items-center border border-[#2c2c2c] drop-shadow-2xl flex gap-4 duration-300 ease-in-out hover:-translate-y-1 cursor-pointer">
                    <img alt="Reymit" src={ReymitLogo} className="w-10 h-10 aspect-auto duration-200 hover:scale-[90%]"></img>
                    <p className="self-center">donate via Reymit</p>
                </div>
            </div>

            <div className={(isCopied ? "opacity-100 " : "opacity-0 ") + "pointer-events-none w-40 h-10 bg-[#363636] absolute top-1/2 left-1/2 -translate-1/2 flex justify-center items-center rounded-md drop-shadow-2xl duration-200 ease-in-out"}>
                <p>copied to clipboard</p>
            </div>
        </div>
    );
}
