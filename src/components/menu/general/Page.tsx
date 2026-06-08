import { useState } from "react";

export default function General(){
    const [clearCache, setClearCache] = useState(true);
    const [startup, setStartup] = useState(false);
    const [systemTrayOnClose, setSystemTrayOnClose] = useState(false);
    const [systemTrayOnMinimize, setSystemTrayOnMinimize] = useState(true);

    return(
        <div className="p-5 w-full h-full flex flex-col items-center gap-2"> 
        {/* clear cache */}
            <div className="w-full flex justify-between items-center bg-[#1f2023] drop-shadow-2xl p-2 rounded-full border border-[#2c2c2c] group">
                <p className="duration-200 ease-in-out group-hover:pl-2">Clear cache on dns change</p>
                <label htmlFor="clearCache">
                    <div className={(clearCache ? "bg-blue-600 " : "bg-[#363636] ") + "w-10 h-5 rounded-full relative flex items-center duration-200 ease-in-out"} onClick={()=>{setClearCache(prev => !prev)}}>
                        <div className={(clearCache ? "translate-x-5 " : "translate-x-0 ") + "bg-white w-4 h-4 rounded-full absolute duration-200 ease-in-out left-0.5"}></div>
                    </div>
                    <input type="checkbox" name="clearCache" id="clearCache" hidden defaultChecked={clearCache}/>
                </label>
            </div>
        {/* startup */}
            <div className="w-full flex justify-between items-center bg-[#1f2023] drop-shadow-2xl p-2 rounded-full border border-[#2c2c2c] group">
                <p className="duration-200 ease-in-out group-hover:pl-2">Run on start</p>
                <label htmlFor="startup">
                    <div className={(startup ? "bg-blue-600 " : "bg-[#363636] ") + "w-10 h-5 rounded-full relative flex items-center duration-200 ease-in-out"} onClick={()=>{setStartup(prev => !prev)}}>
                        <div className={(startup ? "translate-x-5 " : "translate-x-0 ") + "bg-white w-4 h-4 rounded-full absolute duration-200 ease-in-out left-0.5"}></div>
                    </div>
                    <input type="checkbox" name="startup" id="startup" hidden defaultChecked={startup}/>
                </label>
            </div>
        {/* system tray on close */}
            <div className="w-full flex justify-between items-center bg-[#1f2023] drop-shadow-2xl p-2 rounded-full border border-[#2c2c2c] group">
                <p className="duration-200 ease-in-out group-hover:pl-2">Stay open in system tray | close</p>
                <label htmlFor="systemTrayOnClose">
                    <div className={(systemTrayOnClose ? "bg-blue-600 " : "bg-[#363636] ") + "w-10 h-5 rounded-full relative flex items-center duration-200 ease-in-out"} onClick={()=>{setSystemTrayOnClose(prev => !prev)}}>
                        <div className={(systemTrayOnClose ? "translate-x-5 " : "translate-x-0 ") + "bg-white w-4 h-4 rounded-full absolute duration-200 ease-in-out left-0.5"}></div>
                    </div>
                    <input type="checkbox" name="systemTrayOnClose" id="systemTrayOnClose" hidden defaultChecked={systemTrayOnClose}/>
                </label>
            </div>
        {/* system tray on minimize */}
            <div className="w-full flex justify-between items-center bg-[#1f2023] drop-shadow-2xl p-2 rounded-full border border-[#2c2c2c] group">
                <p className="duration-200 ease-in-out group-hover:pl-2">Stay open in system tray | minimize</p>
                <label htmlFor="systemTrayOnMinimize">
                    <div className={(systemTrayOnMinimize ? "bg-blue-600 " : "bg-[#363636] ") + "w-10 h-5 rounded-full relative flex items-center duration-200 ease-in-out"} onClick={()=>{setSystemTrayOnMinimize(prev => !prev)}}>
                        <div className={(systemTrayOnMinimize ? "translate-x-5 " : "translate-x-0 ") + "bg-white w-4 h-4 rounded-full absolute duration-200 ease-in-out left-0.5"}></div>
                    </div>
                    <input type="checkbox" name="systemTrayOnMinimize" id="systemTrayOnMinimize" hidden defaultChecked={systemTrayOnMinimize}/>
                </label>
            </div>
        </div>
    );
}