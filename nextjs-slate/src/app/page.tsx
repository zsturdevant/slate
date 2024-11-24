"useclient";

import Header from "@/components/Header";
import TextArea from "@/components/TextArea";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header will be where you could rename the document and doe various other things */}
      <Header />
      <TextArea />
      
    </div>
  );
}
