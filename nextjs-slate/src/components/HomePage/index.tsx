// "use client";

import Image from 'next/image';
import Link from 'next/link';
// import { useState } from 'react';


export default function Home() {
  // const [num,setNum] = useState('');
  const files = ['file 1', 'file 2', 'file 3', 'file 4'];


  return (
    <>
      <div className='flex flex-col font-mono ml-8 mt-4 gap-4'>
        <div id="header" className="header flex items-center gap-4">
          {/* Div with Logo, username+"'s drive"*/}
          {/* Button to add new document or folder
                - If you add a doc, open it in new tab. this means the current home tab will have to update with the new document information
                - If you add a folder, just do it right there in the home page */}
          {/* Folders at the top google docs style. This will be one grid component */}
          {/* Files below the folders. This will be just a regular flex-col list with a separating line in between.
              Make sure to add hover animations */}
          <Image src="S-1.svg" width={50} height={50} alt='Logo'/> 
          <p className="text-4xl"> Welcome </p>
        </div>
        <button id='add_file_or_folder' className='bg-[#5A5A5A] w-24 rounded-md h-8 ml-8'>
          {/* on click should potentially ask about whether they want to create a folder or a file */}
            <Link href="TextEditor">Add + </Link>
        </button>
        <div className="files text-xl">
          <p> Files </p>
          {files.map((file, index) => (
            <div key={index} className='ml-4 text-lg'>{file}</div>
          ))}
        </div>

      </div>

    </>
  );
}
