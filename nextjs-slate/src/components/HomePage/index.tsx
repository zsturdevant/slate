"use client";

import Image from 'next/image';
import Link from 'next/link';
import Card from "@/components/Card";
import { getDocList } from '@/yjsClient';  // Assuming getDocList is correctly imported
import { useState, useEffect } from 'react';

export default function Home() {
  const [docList, setDocList] = useState();
  const [loading, setLoading] = useState(true);  // State to track loading status
  const [error, setError] = useState<string | null>(null);  // State to track any errors

  // Fetch document list on component mount
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await getDocList();  // Wait for the document list
        console.log("This is the type of docs: ", typeof(docs))
        console.log("This is docs: ", docs)
        setDocList(docs);  // Set the docs to state
      } catch (err) {
        setError('Failed to load documents');  // Handle error
      } finally {
        setLoading(false);  // Set loading to false when done
      }
    };

    fetchDocs();
  }, []);  // Empty dependency array means this runs only once on mount

  if (loading) {
    return <div></div>;  // Show loading text while fetching docs
  }

  if (error) {
    return <div>{error}</div>;  // Show error message if fetching fails
  }

  return (
    <>
      <div className='flex flex-col font-mono ml-8 mt-4 gap-4'>
        <div id="header" className="header flex items-center gap-4">
          <Image src="S-1.svg" width={50} height={50} alt='Logo'/>
          <p className="text-4xl"> Welcome </p>
        </div>
        <button id='add_file_or_folder' className='bg-[#5A5A5A] w-24 rounded-md h-8 ml-8'>
          <Link href={{
            pathname: '/TextEditor',
            query: { docname: 'untitled' }
          }}>Add + </Link>
        </button>
        <div className="files text-xl">
          <p> Files </p>
          {docList.length > 0 ? (
            docList.map((file, index) => (
              <Card key={index} docname={file} />
            ))
          ) : (
            <p>No files available.</p>  // Show a message if no files are available
          )}
        </div>
      </div>
    </>
  );
}
