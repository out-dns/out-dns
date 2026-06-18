import {Window } from "@tauri-apps/api/window";
import closePNG from "./../../assets/close.png"
import minimizePNG from "./../../assets/minimize.png"
import { invoke } from "@tauri-apps/api/core";

interface Configs{
    id: number,
    flush_dns_on_change: boolean,
    run_on_start: boolean,
    minimize_to_tray: boolean,
    close_to_tray: boolean
}
export default function TitleBar(){
    const win = Window.getCurrent();
    let configs: Configs;
    invoke<Configs>("get_configs")
    .then((result)=>{
        configs = result;
    })
    .catch((e)=>{
        console.log(e);
    });

    const minimize = ()=>{
        if(configs.minimize_to_tray){
            win.hide();
        }else{
            win.minimize();
        }
    }
    const close = ()=>{
        if(configs.close_to_tray){
            win.hide();
        }else{
            win.close();
        }
    }

    return(
        <div className="titlebar fixed top-0 left-0 w-full h-6 bg-[#1f2023] overflow-hidden flex justify-end items-center select-none">
            <div data-tauri-drag-region className="titlebar w-full h-full"></div>
            <p data-tauri-drag-region className="fixed top-1 left-1/2 -translate-x-1/2 text-[0.9rem] text-[#aaa]">Out DNS</p>
            <button title="minimize" className="flex w-10 h-6 justify-center items-center hover:bg-[#363636] duration-200 ease-in-out group" onClick={minimize}>
                <img src={minimizePNG} alt="minimize" className="w-3.5 h-3.5 group-active:scale-70 duration-200 ease-in-out" />
            </button>
            <button title="close" className="flex w-10 h-6 justify-center items-center hover:bg-red-800 duration-200 ease-in-out group" onClick={close}>
                <img src={closePNG} alt="close" className="w-3.5 h-3.5 group-active:scale-70 duration-200 ease-in-out" />
            </button>
        </div>
    );
}