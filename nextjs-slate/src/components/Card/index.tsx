import Link from "next/link";
// import router, { useRouter } from "next/navigation";
// import { deleteDocument } from '@/yjsClient'; 

export default function Card({ docname, onDelete }: { docname: string, onDelete: (docname: string) => void }) {
  // const router = useRouter();
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the document "${docname}"?`)) {
      onDelete(docname);
    }
  };

  const cardClicked = () => {

    console.log("From Card:\n     This is the docname: ", docname);
    // const sp = new URLSearchParams()
    // sp.set('docname', docname)
    // router.push(`/TextEditor?${sp.toString()}`);
  };

  return (
    /*<button
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
    </button>*/
    <div className="flex justify-between items-center p-4 border mb-4">
        <Link prefetch={false} replace={true} href={{pathname: '/TextEditor', query: { docname: docname },}} passHref
              className="bg-[#5A5A5A] rounded-md p-2 transition ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500 duration-300">
          <button className='max-w-1/3 min-w-24 h-auto focus:outline-none' onClick={cardClicked}>
            {docname}
          </button>
        </Link>
        <button className="text-red-500 transition ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500 rounded-md p-2 duration-300" onClick={handleDelete}>
          Delete
        </button>
    </div>
  );
}
