"useclient";

import {Header} from "@/components/TextArea";
import TextArea from "@/components/TextArea";
import Link from 'next/link';
import React, { useState } from "react";


// TODO: hover animations for buttons and text boxes

export default function TextEditor() {
  return (
    <div className="flex flex-col h-screen font-mono">
      {/* Header will be where you could rename the document and doe various other things */}
      <Header />
      <TextArea />
    </div>
  );
}
