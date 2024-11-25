"useclient";

export default function Home() {
  return (
    <div className="flex flex-col h-screen font-mono">
      {/* Div with Logo, username+"'s drive"*/}
      {/* Button to add new document or folder
            - If you add a doc, open it in new tab. this means the current home tab will have to update with the new document information
            - If you add a folder, just do it right there in the home page */}
      {/* Folders at the top google docs style. This will be one grid component */}
      {/* Files below the folders. This will be just a regular flex-col list with a separating line in between.
          Make sure to add hover animations */}
      Welcome to the home page! There is nothing here currently
    </div>
  );
}
