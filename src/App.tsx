import { useEffect, useRef, useState } from "react";

import HMenu from "./components/buttons/HMenu";
import MenuLayout from "./components/menu/Layout";
import ClearCacheButton from "./components/buttons/ClearCacheButton";
import SetDNSButton from "./components/buttons/SetDNSButton";
import NetworkInterfaces from "./components/comboBox/network-interfaces";
import DnsServersInp from "./components/input/dns-servers-inp";
import TitleBar from "./components/titlebar/titlebar";
import DnsList from "./components/dns/dns-servers";


function App() {
  const [menuStatus, setMenuStatus] = useState(false); 
  const [logContent, setLogContent] = useState<string[]>([]);
  const logRef = useRef<HTMLTextAreaElement>(null);

  function log(message: string){
    setLogContent(prev => [...prev , new Date().toLocaleTimeString() + " | " + message]);
  }
  useEffect(()=>{
    if(logRef.current){
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  });


  return (
    <main className="bg-[#1f2023] overflow-hidden min-w-screen min-h-screen">
      <TitleBar></TitleBar>
      <HMenu setMenuStatus={setMenuStatus}></HMenu>
      <MenuLayout menuStatus={menuStatus} setMenuStatus={setMenuStatus}></MenuLayout>

      <NetworkInterfaces></NetworkInterfaces>

      <DnsList></DnsList>

      <DnsServersInp></DnsServersInp>

      <div className="absolute bottom-5 right-5 flex flex-col gap-4 text-white">
        <SetDNSButton></SetDNSButton>
        <ClearCacheButton log={log}></ClearCacheButton>
      </div>

      <div className="w-[350px] h-[100px] bg-[#363636] p-0 m-0 rounded-md absolute bottom-5 left-5 overflow-hidden">
          <div className="w-[300px] h-[300px] border-[#1f2023] border-[20px] rounded-full top-[20px] left-[80px] absolute"></div>
          <textarea name="log" id="log" placeholder="logs..." className="resize-none outline-none border-0 p-2 absolute inset-0 overflow-y-auto overflow-x-hidden bg-transparent text-[#ccc] z-10 w-full h-full scrollbar-thumb-transparent scroll-smooth font-mono text-[0.8rem]" readOnly value={logContent.join('\n')} ref={logRef}></textarea>
      </div>

    </main>
  );
}

export default App;
