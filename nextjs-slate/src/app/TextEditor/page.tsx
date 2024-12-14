"use client";

import {Header} from "@/components/TextArea";
import TextArea from "@/components/TextArea";
import Link from 'next/link';
import React, { useState } from "react";
import { getYDoc } from '../../yjsClient';
import { useSearchParams } from 'next/navigation'; 

// TODO: hover animations for buttons and text boxes

export default function TextEditor() {
  const searchParams = useSearchParams();
  const docname = searchParams.get('docname');
  console.log("This is the url docname field: ", docname)
  const { ydoc } = getYDoc(docname);
  console.log("This is ydoc title: ", ydoc.getText('shared-title').toString())

  return (
    <div className="flex flex-col h-screen font-mono">
      {/* Header will be where you could rename the document and doe various other things */}
      <Header doc={ydoc} />
      <TextArea doc={ydoc} />
    </div>
  );
}
