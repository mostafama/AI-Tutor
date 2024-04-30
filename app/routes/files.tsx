//  This page will handle the file upload and display the uploaded files
// However, since the file upload functionality is not fully implemented, the page is excluded from the navigation menu
// At current state, the file can be uploaded to the server; but the file cannot be accessed by the API

// Author: Jerry Fan
// Date: 4/30/2024

import {
    json,
    unstable_createMemoryUploadHandler,
    unstable_parseMultipartFormData,
    unstable_createFileUploadHandler,
    unstable_composeUploadHandlers,
  } from "@remix-run/node";
  import { useUser } from "~/utils";
  import type { NodeOnDiskFile, ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
  import { Form, Link, useFetcher } from "@remix-run/react";
  import { FormEvent, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
  import { createFile, listUserFiles, getFileDetails, deleteFile } from "~/models/file.server";
  import { requireUserId } from "~/session.server";
  
  export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const files = await listUserFiles(userId);
    return json({ files }); // Return the list of files uploaded by the user
  };

  export async function action({ request }: ActionFunctionArgs) {
    let name;
    let path;
    
    let formData = await unstable_parseMultipartFormData(
      request,
      unstable_composeUploadHandlers(
        unstable_createFileUploadHandler({
          // Limit file upload to PDFs
          filter({ contentType }) {
            return contentType === "application/pdf";
          },
          // Store the PDFs in the public/lecture-slides folder
          directory: "public/lecture-slides",
          // By default `unstable_createFileUploadHandler` adds a number to the file
          // names if there's another with the same name. By disabling it, we replace
          // the old file
          avoidFileConflicts: false,
          // Use the actual filename as the final filename
          file({ filename }) {
            name = filename;
            return filename;
          },
          // Limit the max size to 10MB
          maxPartSize: 10 * 1024 * 1024,
        }),
        unstable_createMemoryUploadHandler(),
        
      ),
    );

    const userId = await requireUserId(request);
  
    let files = formData.getAll("file") as NodeOnDiskFile[];
    return json({
      files: files.map((file) => ({
        name: file.name,
        // Adjusted the URL path to reflect the new storage location
        url: `/lecture-slides/${file.name}`,
      })),
    });
  }
  
  // This component will display the file upload form and the list of uploaded files
  export default function Component() {
    let { submit, isUploading, pdfs } = useFileUpload();
    const user = useUser();
  
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-slate-800 p-4 text-white flex justify-between items-center">
          <h1 className="text-3xl font-bold"><Link to="/">AICADEMY</Link></h1>
          <p>{user.userType}: {user.email}</p>
          <Form action="/logout" method="post">
            <Link to="/home" className="mr-2 rounded-md bg-white px-4 py-2 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50">Home</Link>
            <button type="submit" className="rounded-md bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600">Logout</button>
          </Form>
        </header>
  
        <main className="flex-1 p-4">
          <h2 className="text-lg font-bold mb-4">Upload a PDF</h2>
          <label className={`${isUploading ? 'opacity-50' : ''} block p-4 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50`}>
            {isUploading ? (
              <p>Uploading PDF...</p>
            ) : (
              <p>Select a PDF file to upload</p>
            )}
            <input
              name="file"
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              disabled={isUploading}
              onChange={(event) => submit(event.currentTarget.files)}
            />
          </label>
        </main>
  
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">Uploaded PDFs</h2>
          {pdfs.length > 0 ? (
            <ul>
              {pdfs.map((file, index) => (
                <li key={index} className="mb-2">
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    {file.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No PDFs uploaded yet.</p>
          )}
        </div>
      </div>
    );
  }
  
  function useFileUpload() {
    let { submit, data, state, formData } = useFetcher<typeof action>();
    let isUploading = state !== "idle";
  
    let uploadingFiles = formData
      ?.getAll("file")
      ?.filter((value: unknown): value is File => value instanceof File)
      .map((file) => {
        let name = file.name;
        // This line is important, this will create an Object URL, which is a `blob:` URL string
        // We'll need this to render the image in the browser as it's being uploaded
        let url = URL.createObjectURL(file);
        return { name, url };
      });
  
    let pdfs = (data?.files ?? []).concat(uploadingFiles ?? []);
  
    return {
      submit(files: FileList | null) {
        if (!files) return;
        let formData = new FormData();
        for (let file of files) formData.append("file", file);
        submit(formData, { method: "POST", encType: "multipart/form-data" });
      },
      isUploading,
      pdfs,
    };
  }
  
  function PDFLink({ name, url }: { name: string; url: string }) {
    // Optionally, handle object URLs for blobs, if you're generating such URLs
    let [objectUrl] = useState(() => url.startsWith("blob:") ? url : undefined);

    useEffect(() => {
        // Clean up blob URLs when the component unmounts or URL changes
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    return (
        <div>
            {/* Display the PDF file's name and a link to view/download */}
            <a href={url} download={name} target="_blank" rel="noopener noreferrer">
                {name}
            </a>
        </div>
    );
  }

  export function Files() {
    const fetcher = useFetcher();
  
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
  
      try {
        // Assuming '/api/upload-file' is your server-side endpoint for handling file uploads
        const response = await fetch('/models/file.server', {
          method: 'POST',
          body: data,
        });
  
        if (!response.ok) {
          throw new Error('File upload failed');
        }
  
        // Optionally, handle the response from the server
        const result = await response.json();
        console.log('File uploaded successfully', result);
  
        // You might want to update your UI or state here based on the response
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    };
  
    return (
      <div>
        <h1>Upload a File</h1>
        <form onSubmit={handleSubmit}>
          <input type="file" name="file" />
          <button type="submit">Upload File</button>
        </form>
      </div>
    );
  }