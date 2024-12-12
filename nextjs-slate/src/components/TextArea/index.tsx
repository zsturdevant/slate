"use client";

import React, { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { getYDoc } from '../../yjsClient';

// call getYDoc() outside component to ensure a single shared instance
const { ydoc } = getYDoc();

export default function TextArea() {
    const [text, setText] = useState('');
    const [docname, setDocname] = useState('');
  
    useEffect(() => {
      // get the shared text from the global ydoc instance
      const sharedText = ydoc.getText('shared-text');
      
      // make this text the state that we see on screen
      const updateText = () => setText(sharedText.toString());
  
      // Sync local state with shared state
      sharedText.observe(updateText);
      updateText();
  
      return () => sharedText.unobserve(updateText);
    }, [docname]);

    const handleChange = (e) => {
      // const { ydoc } = getYDoc(docname);

      // get the shared text from the global ydoc instance
      const sharedText = ydoc.getText('shared-text');

      sharedText.delete(0, sharedText.length);
      sharedText.insert(0, e.target.value);
  
      };
    
    // just edit where the curser is?
    // const handleChange = (e) => {
    //   const { ydoc } = getYDoc();
    //   const sharedText = ydoc.getText('shared-text');
    //   const cursorPos = e.target.selectionStart;
  
    //   sharedText.delete(cursorPos, e.target.value.length);
    //   sharedText.insert(cursorPos, e.target.value);
    // };
    
    return (
        <div className="flex-grow flex justify-center items-center px-60 bg-[#F9FBFD] dark:bg-[#1E202F]">
        {/* TODO: Dynamically resize depending on how much text the user has already written. This will be non paginated for now */}
        {/* bg-neutral-900 */}
        {/* This doesn't behave as nicely as I want it to. I want it to stay the same size until there is no space left on the sides
            in which case I want it to shrink */}
            <textarea 
                    className="bg-[#ffffff] dark:bg-[#222435] text-red-500 placeholder:text-[#5A5A5A] dark:placeholder:text-[#b5c1ec] dark:text-[#CAD3F2]
                               flex-initial flex-shrink-0 resize-none outline-none border-[#eeeeee] border-2 dark:border-[#8FADF3] dark:border-b-transparent border-b-transparent
                               w-8/12 min-w-[500px] max-w-[650px] h-full mx-auto
                               px-8 py-4 rounded-t-md focus:placeholder-transparent"
                    placeholder="Hello:) Type here"
                    value={text}
                    onChange={handleChange}/>
      </div>
    );
}