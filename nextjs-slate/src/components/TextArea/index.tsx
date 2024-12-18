"use client";

//import { renameDocument } from '@/yjsClient';
import { renameDocument } from '@/yjsClient';
import React, { useEffect, useState } from 'react';
import { FaArrowLeftLong} from "react-icons/fa6";
import Link from 'next/link';
import * as Y from 'yjs';
// import { KeyObject } from 'crypto';

export function Header({doc}: {doc: Y.Doc}) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    // get the shared text from the global ydoc instance
    const sharedTitle = doc.getText('shared-title');
    console.log("From Header Input Field:\n     This is the title: ", sharedTitle.toString());
    // make this text the state that we see on screen
    const updateTitle = () => setTitle(sharedTitle.toString());

    // Sync local state with shared state
    sharedTitle.observe(updateTitle);
    updateTitle();

    return () => sharedTitle.unobserve(updateTitle);
  }, [doc]);

  const handleTitleChange = (e:any) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
  };

  const handleTitleKeyDown = (e: any) => {
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n" + e);
    // Optional: Save title changes on Enter and blur the input
    if (e.key === 'Enter') {
      e.target.blur(); // Unfocus the input field

      //update shared title in the Y.Doc
      const sharedTitle = doc.getText('shared-title');
      sharedTitle.delete(0, sharedTitle.length);
      sharedTitle.insert(0, title);

      // Notify the server about the title change
      renameDocument(title);
    }
  };

  return (
      <>
      <div className="header-wrapper flex flex-col w-full p-4 bg-[#F9FBFD] dark:bg-[#1E202F]">
          <div className="top-part flex items-center text-2xl gap-4 m-2">
              <div className="flex items-center gap-2">
                  <button className='transition ease-in-out hover:-translate-y-1 hover:scale-110 rounded-md p-2 duration-300'>
                    <Link href={'.'}> <FaArrowLeftLong/> </Link>
                  </button>
              </div>
              <input 
                className="doc-name max-w-64 w-auto truncate rounded-md bg-inherit dark:bg-[#1E202F]
                            transition ease-in-out focus:-translate-y-1 hover:-translate-y-1 focus:scale-110 hover:scale-110 outline-none p-2 duration-300"
                defaultValue={title}
                onChange={handleTitleChange}
                onKeyDown={handleTitleKeyDown}
                />
          </div>
          <div className="bottom-part text-[#5A5A5A] rounded-3xl p-2 bg-[#e8eaee] dark:bg-[#87AEF9] text-center">
              {/* formatting stuff like bold and sheet */}
          </div>
      </div>
    </>
  );
}

export default function TextArea({doc}: {doc: Y.Doc}) {
    const [text, setText] = useState('');
  
    useEffect(() => {
      // get the shared text from the global ydoc instance
      const sharedText = doc.getText('shared-text');
      
      // make this text the state that we see on screen
      const updateText = () => setText(sharedText.toString());
  
      // Sync local state with shared state
      sharedText.observe(updateText);
      updateText();
  
      return () => sharedText.unobserve(updateText);
    }, [doc]);

    // just edit where the curser is?
    const handleChange = (e: any) => {
      // get the shared text from the global ydoc instance
      const sharedText = doc.getText('shared-text');

      sharedText.delete(0, sharedText.length);
      sharedText.insert(0, e.target.value);
  
      };
    
    return (
        <div className="flex-grow flex justify-center items-center px-60 bg-[#F9FBFD] dark:bg-[#1E202F]">
        {/* TODO: Dynamically resize depending on how much text the user has already written. This will be non paginated for now */}
        {/* bg-neutral-900 */}
        {/* This doesn't behave as nicely as I want it to. I want it to stay the same size until there is no space left on the sides
            in which case I want it to shrink */}
            <textarea 
                    className="bg-[#ffffff] dark:bg-[#222435] text-red-500 placeholder:text-[#5A5A5A] dark:placeholder:text-[#b5c1ec] dark:text-[#CAD3F2]
                               flex-initial flex-shrink-0 resize-none outline-none border-[#eeeeee] border-2 dark:border-[#8FADF3] dark:border-b-transparent border-b-transparent
                               w-10/12 min-w-[500px] h-full
                               px-8 py-4 mx-auto rounded-t-md focus:placeholder-transparent"
                    value={text}
                    onChange={handleChange}/>
      </div>
    );
}