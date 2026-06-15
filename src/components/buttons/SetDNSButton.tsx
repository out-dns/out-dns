import { invoke } from "@tauri-apps/api/core";
import { usePopup } from "../../contexts/popupContext";
import { useLog } from "../../contexts/logContext";

export default function SetDNSButton({
        selectedInterface,
        primaryDns,
        secondaryDns
    }: {
        selectedInterface: string,
        primaryDns: string,
        secondaryDns: string
    }){
    const {showPopup} = usePopup();
    const {log} = useLog();

    const set_dns = () => {
        invoke<string>("set_dns",{interface: selectedInterface,primary: primaryDns,secondary: secondaryDns})
        .then((result)=>{
            showPopup("success");
            log(`${result} ✅`);
        })
        .catch((error)=>{
            showPopup("warning");
            log(`${error} ❌`);
        });

    }
    return(
        <div className="border-[##1f2023] w-[150px] h-[40px] rounded-sm bg-[#2052a8] relative overflow-hidden active:scale-[90%] duration-200">
            <button onClick={set_dns} className="absolute top-0 left-0 w-[150px] h-[40px] z-10 peer select-none text-[1.2rem]">Set DNS</button>
            <div className="w-[100px] h-[100px] border-[20px] border-[#1f2023] rounded-full absolute -top-30 -left-30 z-0 peer-hover:translate-x-[80px] peer-hover:translate-y-[70px] duration-300 ease-in-out"></div>
        </div>
    );
}