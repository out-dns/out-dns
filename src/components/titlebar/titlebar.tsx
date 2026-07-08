import {Window } from "@tauri-apps/api/window";
import closePNG from "./../../assets/close.png"
import minimizePNG from "./../../assets/minimize.png"
import { useConfig } from "../../contexts/configsContext";

export default function TitleBar(){
    const win = Window.getCurrent();
    const {configs} = useConfig();

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
        <div className="titlebar fixed top-0 left-0 w-full h-8 bg-[#1f2023] overflow-hidden flex justify-end items-center select-none">
            <div data-tauri-drag-region className="titlebar w-full h-full"></div>
            <p data-tauri-drag-region className="fixed top-1 left-1/2 -translate-x-1/2 text-[1rem] text-[#aaa]">Out DNS</p>
            <button title="minimize" className="flex w-[1.4rem] h-[1.4rem] rounded-full justify-center items-center bg-[#373737] hover:bg-[#4b4b4b] duration-200 ease-in-out p-1 group" onClick={minimize}>
                <img src={minimizePNG} alt="minimize" className="w-full h-full duration-500 ease-in-out invert group-hover:scale-x-60" />
            </button>
            <button title="close" className="flex w-[1.4rem] h-[1.4rem] rounded-full justify-center items-center bg-[#373737] hover:bg-[#812020] duration-200 ease-in-out p-1 ml-2 mr-2 group" onClick={close}>
                <img src={closePNG} alt="close" className="w-full h-full duration-500 ease-in-out invert group-hover:rotate-90" />
            </button>
        </div>
    );
}