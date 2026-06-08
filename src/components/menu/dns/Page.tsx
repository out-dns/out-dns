export default function DNS(){
    return(
        <div className="w-full h-full flex flex-col items-center p-5 gap-4">
            <div className="w-11/12 h-36 rounded-md bg-[#1f2023] border border-[#2c2c2c] drop-shadow-2xl">

            </div>

            <div className="w-full flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    <input className="outline-none bg-[#1f2023] rounded-md py-2 px-5 text-center border border-[#0000008c]" type="text" name="" id="" placeholder="primary: 0.0.0.0" maxLength={15}/>
                    <input className="outline-none bg-[#1f2023] rounded-md py-2 px-5 text-center border border-[#0000008c]" type="text" name="" id="" placeholder="secondary: 0.0.0.0" maxLength={15}/>
                </div>
                <div className="flex flex-col gap-2">
                    <button className="w-30 h-11 bg-[#2052a8] rounded-md text-center drop-shadow-2xl border border-[#ffffff17]">Add</button>
                    <button className="w-30 h-11 bg-[#2052a8] rounded-md text-center drop-shadow-2xl border border-[#ffffff17]">clear</button>
                </div>
            </div>
        </div>
    );
}