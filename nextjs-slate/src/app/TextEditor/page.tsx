"use client";

import {Header} from "@/components/TextArea";
import TextArea from "@/components/TextArea";
import Link from 'next/link';
import React, { useState } from "react";
import { getYDoc } from '../../yjsClient';
import { useSearchParams } from 'next/navigation';
import { unstable_noStore as noStore } from "next/cache";

// TODO: hover animations for buttons and text boxes

export default function TextEditor() {
  noStore();
  const searchParams = useSearchParams();
  const docname = searchParams.get('docname');
  console.log("From TextEditor Page:\n     This is the url docname field: ", docname)
  const { ydoc, document_id } = getYDoc(docname);
  console.log("From TextEditor Page:\n     This is ydoc title: ", ydoc.getText('shared-title').toString())
  console.log("From TextEditor Page:\n     This is doc_id: ", document_id)

  return (
    <div className="flex flex-col h-screen font-mono">
      {/* Header will be where you could rename the document and doe various other things */}
      <Header doc={ydoc} />
      <TextArea doc={ydoc} />
    </div>
  );
}
