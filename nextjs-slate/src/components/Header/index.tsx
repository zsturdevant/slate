"use client";

import { FaArrowLeftLong, FaArrowRightLong, FaBars } from "react-icons/fa6";

export default function Header() {
    return (
        <>
        {/* <div className='flex justify-center text-2xl py-4'> Yuh </div> */}
        <div className="header-wrapper flex flex-col w-full p-4 bg-[#F9FBFD] dark:bg-[#1E202F]">
            <div className="top-part flex items-center text-2xl gap-4 m-2">
                <button className="menu"> <FaBars/> </button>
                <div className="arrows flex items-center gap-2">
                    <button> <FaArrowLeftLong/> </button>
                    <button> <FaArrowRightLong/> </button>
                </div>
                {/* TODO: Save name when eneter key is pressed and unfocus/unselect the input field*/}
                <input className="doc-name placeholder:text-[#5A5A5A] dark:placeholder:text-[#b5c1ec] max-w-64 w-auto truncate bg-inherit dark:bg-[#1E202F] focus:placeholder-transparent" placeholder="Untitled Document"/>
                
            </div>
            <div className="bottom-part text-[#5A5A5A] rounded-3xl p-2 bg-[#e8eaee] dark:bg-[#87AEF9] text-center">
                {/* formatting stuff like bold and sheet */}
                Options bar for (for things like BUI)
            </div>
        </div>
        </>
    );
    
}