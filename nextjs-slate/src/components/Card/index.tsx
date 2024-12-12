import Link from "next/link";

export default function Card({ docname }: { docname: string }) {
  return (
    <button
      className='bg-[#5A5A5A] w-24 rounded-md h-8 ml-8 hover:bg-[#888] focus:outline-none'
    >
      <Link
        href={{
          pathname: '/TextEditor',
          query: { docname: docname },
        }}
        passHref
      >
        {docname}
      </Link>
    </button>
  );
}
