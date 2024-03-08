// app/routes/api/upload.tsx
import { ActionFunction, LoaderFunction, json } from '@remix-run/node';
import { uploadFile } from '~/models/upload.server'; // Adjust the import path as necessary

export const loader: LoaderFunction = async ({ request }) => {
    return json({ message: 'This endpoint is for file uploads only.' });
  };
  
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get('file');

  if (file && file instanceof File) {
    try {
      const fileId = await uploadFile(file); // Call the function and pass the File object
      return json({ success: true, fileId });
    } catch (error) {
      console.error("Failed to upload file:", error);
      return json({ success: false, message: 'File upload failed' }, { status: 500 });
    }
  } else {
    return json({ success: false, message: 'No file uploaded' }, { status: 400 });
  }
};
