"use client";

import Image from 'next/image';
import Link from 'next/link';
import Card from "@/components/Card";
import { getDocList, deleteDocument } from '@/yjsClient';
import { useState, useEffect } from 'react';

export default function Home() {
  const [docList, setDocList] = useState<string[]>([]); //useState()'
  const [loading, setLoading] = useState(true);  // State to track loading status
  const [error, setError] = useState<string | null>(null);  // State to track any errors
  const [untitledName, setUntitledName] = useState('');

  // Fetch document list on component mount
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await getDocList();  // Wait for the document list
        console.log("This is the type of docs: ", typeof(docs))
        console.log("This is docs: ", docs)
        setDocList(docs);  // Set the docs to state
        let found = false; // flag: has appropriate next untitled doc number been found
        let i = 1; // scan doc list for 'untitled 1, ...'
        while (!found) { // keep going until you find a good next number
          const potential_name = 'untitled ' + i.toString();
          if (!docs.includes(potential_name)) { // if 'untitled i' doesn't exist yet
            found = true; // we have found an appropriate name
            setUntitledName(potential_name);
          } else {
            i = i + 1; // increment counter to keep looking for an appropriate name
          }
        }
      } catch (err) {
        setError('Failed to load documents:' + err);  // Handle error
      } finally {
        setLoading(false);  // Set loading to false when done
      }
    };

    fetchDocs();
  }, []);  // Empty dependency array means this runs only once on mount
  
  const handleDelete = (docname: string) => {
    deleteDocument(docname);  // Call the delete function
    // Remove deleted document from the docList state
    setDocList((prevList) => prevList.filter((doc) => doc !== docname));
  };

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
          <p className="text-4xl"> Slate </p>
        </div>
        <button id='add_file_or_folder' className='bg-[#5A5A5A] w-24 rounded-md h-8 ml-8'>
          <Link prefetch = {false} href={{
            pathname: '/TextEditor',
            query: { docname: untitledName }
          }}>Add + </Link>
        </button>
        <div className="files text-xl">
          <p> Files </p>
          {docList.length > 0 ? (
            docList.map((file, index) => (
              <Card 
                key={index} 
                docname={file}
                onDelete={handleDelete}
                />
            ))
          ) : (
            <p>No files available.</p>  // Show a message if no files are available
          )}
        </div>
      </div>
    </>
  );
}
