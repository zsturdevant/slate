import Image from "next/image";
import { text } from "stream/consumers";

export default function Home() {
  return (
    <>
      <div className='text-2xl'>
        Yuh
      </div>
      <textarea id="myTextarea" className="bg-white text-red-500 resize outline-none" defaultValue={"Type here"}/>
    </>
  );
}
