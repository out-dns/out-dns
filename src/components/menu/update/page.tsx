import { getVersion } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, Update } from "@tauri-apps/plugin-updater";
import { useEffect, useState } from "react";

import spinningCircle from "./../../../assets/Edupia loading.gif";

export default function UpdateCenter(){
    const [update, setUpdate] = useState<Update | null>(null);

    const [isChecking, setIsChecking] = useState<boolean>(false);

    const [currentVersion, setCurrentVersion] = useState<string | undefined>(undefined);
    const [availableVersion, setAvailableVersion] = useState<string | undefined>(undefined);
    const [updateDescription, setUpdateDescription] = useState<string | undefined>(undefined);

    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [updateStatus, setUpdateStatus] = useState<string>("");

    const [percent, setPercent] = useState<number>(0);

    const check_for_update = ()=>{
        setIsChecking(true);
        check()
        .then((update)=>{
            setUpdate(update);
            setCurrentVersion(update?.currentVersion);
            setAvailableVersion(update?.version);
            setUpdateDescription(update?.body);
        })
        .catch((error)=>{
            console.log(error);
        })
        .finally(()=>{
            setIsChecking(false);
        });

    }
    const install_update = ()=>{
        setPercent(0);
        let contentLength: number = 1;
        let downloaded: number = 0;

        update?.downloadAndInstall((event)=>{
            switch (event.event) {
                case "Started":
                    contentLength = event.data.contentLength || 1;
                    setIsUpdating(true);
                    setUpdateStatus("Downloading");
                    break;
                case "Progress":
                    downloaded += event.data.chunkLength || 0;
                    setPercent(Math.round((downloaded / contentLength) * 100));
                    break;
                case "Finished":
                    setUpdateStatus("Installing");
                    break;
            
                default:
                    break;
            }
        })
        .then(()=>{
            setUpdateStatus("Installed");
            relaunch()
            .catch(()=>{
                setUpdateStatus("Relaunch Failed");
                setTimeout(() => {
                    setIsUpdating(false);
                }, 2000);
            });
        })
        .catch(()=>{
            setUpdateStatus("Update Failed");
            setTimeout(() => {
                setIsUpdating(false);
            }, 2000);
        });
    }
    useEffect(()=>{
        getVersion()
        .then((version)=>{
            setCurrentVersion(version);
        })
        .catch();
    },[]);

    return(
        <div className="w-full h-full p-5 flex flex-col justify-between items-center">
            <div className="w-full min-h-16 bg-[#1f2023] rounded-full border border-[#00000041] drop-shadow-2xl overflow-hidden relative flex justify-between items-center">
                <div className="flex justify-start items-center gap-2 text-[0.9rem] p-2">
                    <p className="opacity-70">Current Version:</p>
                    <p>{currentVersion}</p>
                </div>
                <button onClick={check_for_update} className="p-2 bg-[#175cd3] rounded-full text-white border border-[#1f20239f] drop-shadow-2xl mr-3 drop-shadow-2xl active:scale-95 duration-100 ease-in-out overflow-hidden relative flex justify-center items-center">
                    <p className={(isChecking ? "opacity-0 " : "opacity-100 ") + "duration-300 ease-in-out w-full text-center pt-1"}>Check For Update</p>
                    <img src={spinningCircle} alt="checking" className={(isChecking ? "opacity-100 " : "opacity-0 ") + "rounded-full absolute w-16 h-16 duration-300 ease-in-out drop-shadow-2xl"}/>
                </button>
            </div>

            <div className={(update ? "translate-0 " : "translate-y-32 ") + "w-full min-h-44 bg-[#1f2023] rounded-md border border-[#00000041] drop-shadow-2xl overflow-hidden relative duration-500 ease-in-out group"}>
                <div className={(update ? "bg-[#2052a8] " : "bg-[#363636] ") + "absolute top-0 left-0 w-full text-[0.8rem] flex justify-center items-center drop-shadow-2xl py-1 duration-300 ease-in-out text-[#f0f0f0]"}><p>{update ? "Update available" : "No update available"}</p></div>
                
                <div className={(update ? "opacity-100 " : "opacity-0 ") + "w-full mt-10 flex flex-col justify-start items-center gap-2 text-[0.9rem] duration-300 ease-in-out"}>
                    <div className="w-9/12 bg-[#363636] p-1 rounded-md flex gap-2">
                        <p className="opacity-70">new version:</p>
                        <p>{availableVersion}</p>
                    </div>
                    <div className="w-9/12 bg-[#363636] p-1 rounded-md flex gap-2">
                        <p className="opacity-70">description:</p>
                        <p>{updateDescription}</p>
                    </div>
                </div>

                <button onClick={install_update} className="absolute bottom-2 right-2 p-3 bg-[#1c7441] rounded-md text-[#dadada] drop-shadow-2xl active:scale-95 ease-in-out duration-300 translate-y-14 group-hover:translate-0">download and install</button>
            </div>

            {/* install screen */}
            <div className={(isUpdating ? "opacity-100 " : "opacity-0 pointer-events-none ") + "w-full h-full absolute top-0 left-0 bg-[#1f2023] z-50 duration-300 flex justify-center items-center flex-col gap-4"}>
                <p>{updateStatus}</p>
                <div className="w-10/12 h-4 bg-[#363636] rounded-full drop-shadow-2xl overflow-hidden">
                    <div className={"w-0 h-full bg-[#2052a8] duration-500"} style={{ width: `${percent}%` }}></div>
                </div>
                <div className="p-1 rounded-t-md absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#8d1717] truncate text-[0.9rem] drop-shadow-2xl">
                    <p>don't leave this page while updating</p>
                </div>
            </div>

        </div>
    );
}
