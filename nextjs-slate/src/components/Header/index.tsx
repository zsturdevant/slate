"use client";

import { FaArrowLeftLong, FaArrowRightLong, FaBars } from "react-icons/fa6";

export default function Header() {
    return (
        <>
        {/* <div className='flex justify-center text-2xl py-4'> Yuh </div> */}
        <div className="header-wrapper flex flex-col w-full p-6">
            <div className="top-part flex items-center text-2xl gap-4 m-2">
                <button className="menu"> <FaBars/> </button>
                <div className="arrows flex items-center gap-2">
                    <button> <FaArrowLeftLong/> </button>
                    <button> <FaArrowRightLong/> </button>
                </div>
                {/* TODO: Save name when eneter key is pressed and unfocus/unselect the input field*/}
                <input className="doc-name placeholder:text-[#5A5A5A] bg-[#191919] w-auto" placeholder="Untitled Document"/>
                
            </div>
            <div className="bottom-part bg-[#222222] text-[#5A5A5A] rounded-md p-2">
                {/* formatting stuff like bold and sheet */}
                Options bar
            </div>
        </div>
        </>
    );
    
}