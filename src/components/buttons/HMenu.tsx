
export default function HMenu({setMenuStatus}: {setMenuStatus: React.Dispatch<React.SetStateAction<boolean>>}){
    const menuHandler = ()=>{
        setMenuStatus(prev => !prev);
    }

    return(
        <div className="w-10 h-8 flex justify-start items-baseline gap-1 flex-col absolute top-0 left-0 group overflow-hidden" onClick={menuHandler}>
            <div className="w-3 h-1 mt-2 rounded-full bg-[#e0e0e0] group-hover:w-6.5 duration-300 ease-in-out"></div>
            <div className="w-5 h-1 ml-2 rounded-full bg-[#e0e0e0] group-hover:w-6.5 duration-300 ease-in-out"></div>
        </div>
    );
}