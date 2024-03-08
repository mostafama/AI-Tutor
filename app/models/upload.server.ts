// app/services/openaiIntegration.server.ts
import { OpenAI } from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: "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",
});
export async function uploadFile(file: File) {
    try {
      // Convert the 'File' object to a buffer
      const buffer = Buffer.from(await file.arrayBuffer());
  
      // Use the buffer to create a stream
      const stream = require('stream');
      const readableStream = new stream.Readable();
      readableStream._read = () => {}; // _read is required but you can noop it
      readableStream.push(buffer);
      readableStream.push(null); // Push null to signal the end of the stream (EOF)
  
      // Upload the file to OpenAI
      const fileResponse = await openai.files.create({
        file: fs.createReadStream("test.txt"),
        purpose: 'assistants', // or 'fine-tune' depending on your use case
      });
  
      // Access the file ID from the response
      const fileId = fileResponse.id; // Use the proper response structure to get the ID
      console.log("Uploaded File ID:", fileId);
  
      // Return fileId for further processing
      return fileId;
    } catch (error) {
      console.error("Failed to upload file or create assistant response:", error);
      throw error; // Rethrow the error so it can be caught by the caller
    }
  }