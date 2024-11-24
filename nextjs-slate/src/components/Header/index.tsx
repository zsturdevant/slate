"use client";

import { IconName } from "react-icons/fa6";

export default function Header() {
    return (
        <>
        {/* <div className='flex justify-center text-2xl py-4'> Yuh </div> */}
        <div className="header-wrapper flex flex-col w-full p-6">
            <div className="top-part">
                <input className="doc-name bg-[#191919]"/>
                <div className="buttons">
                    <button></button>
                    <button></button>
                </div>
                <div className="menu"></div>
            </div>
            <div className="bottom-part bg-[#222222] text-[#5A5A5A]">
                {/* formatting stuff like bold and sheet */}
                Formatting bar
            </div>
        </div>
        </>
    );
    
}