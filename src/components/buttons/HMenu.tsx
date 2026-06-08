
export default function HMenu({setMenuStatus}: {setMenuStatus: React.Dispatch<React.SetStateAction<boolean>>}){
    const menuHandler = ()=>{
        setMenuStatus(prev => !prev);
    }

    return(
        <div className="w-[30px] h-fit flex justify-center items-baseline gap-1 flex-col absolute top-2 left-2 group overflow-hidden" onClick={menuHandler}>
            <div className="w-[60%] h-[4px] rounded-full bg-[#aaa] group-hover:w-full duration-300 ease-in-out"></div>
            <div className="w-[80%] h-[4px] rounded-full bg-[#aaa] group-hover:w-full duration-300 ease-in-out"></div>
            <div className="w-[95%] h-[4px] rounded-full bg-[#aaa] group-hover:w-full duration-300 ease-in-out"></div>
        </div>
    );
}