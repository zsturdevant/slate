import Link from "next/link";
import { deleteDocument } from '@/yjsClient'; 

export default function Card({ docname, onDelete }: { docname: string, onDelete: (docname: string) => void }) {
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the document "${docname}"?`)) {
      onDelete(docname);
    }
  };

  const cardClicked = () => {
    console.log("From Card:\n     This is the docname: ", docname)
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
        <Link href={{pathname: '/TextEditor', query: { docname: docname },}} passHref>
          <button className='bg-[#5A5A5A] w-24 rounded-md h-8 hover:bg-[#888] focus:outline-none' onClick={cardClicked}>
            {docname}
          </button>
        </Link>
        <button className="text-red-500 ml-2" onClick={handleDelete}>
          Delete
        </button>
    </div>
  );
}
