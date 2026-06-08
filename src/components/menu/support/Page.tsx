import { openUrl } from '@tauri-apps/plugin-opener';
import ReymitLogo from "./../../../assets/Reymit.svg"
export default function Support(){
    return(
        <div className="w-full h-full flex justify-between items-center flex-col p-5 gap-4">
            <p className="w-12/12 p-1.5 bg-[#1f2023] rounded-sm drop-shadow-2xl text-center">❤️ this application made with love and patience ❤️</p>
            <p className="w-12/12 p-1.5 bg-[#1f2023] rounded-sm drop-shadow-2xl text-center">you can help me in the improvement process</p>
            <img alt="Reymit" src={ReymitLogo} className="w-full h-14 aspect-auto duration-200 hover:scale-[90%] cursor-pointer" onClick={async()=>{await openUrl("https://reymit.ir/amirithm")}}></img>
            <p className="w-12/12 p-1.5 bg-[#1f2023] rounded-sm drop-shadow-2xl text-center">you can also visit application <a href="" className="text-[#2052a8]">repository</a></p>
            <p className="w-12/12 p-1.5 bg-[#1f2023] rounded-sm drop-shadow-2xl text-center">⭐ do not forget to give this repo star ⭐</p>
        </div>
    );
}
