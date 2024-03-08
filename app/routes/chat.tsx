// src/components/Chat.tsx
import React, { useEffect, useRef, useState } from "react";
import { TextField, Button, Container, Grid, CircularProgress, LinearProgress, FormControl, InputLabel, Select, MenuItem, IconButton } from "@mui/material";
import Message from "./Message";
import OpenAI from "openai";
import { MessageDto } from "./MessageDto";
import { useFetcher } from "@remix-run/react";
import { uploadFile } from "~/models/upload.server";
import "~/styles/chat.css";
import DeleteIcon from '@mui/icons-material/Delete';

const Chat: React.FC = () => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<MessageDto>>(new Array<MessageDto>());
  const [input, setInput] = useState<string>("");
  const [assistant, setAssistant] = useState<any>(null);
  const [thread, setThread] = useState<any>(null);
  const [openai, setOpenai] = useState<any>(null);
  const fetcher = useFetcher();
  const [userRole, setUserRole] = useState<'student' | 'professor'>('professor'); // Example user role state

  const [instructions, setInstructions] = useState<string[]>(["You are a personalized CS Tutor"]);
  const [selectedInstruction, setSelectedInstruction] = useState<string>("You are a personalized CS Tutor");
  const [newInstruction, setNewInstruction] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);



  // useEffect(() => {
  //   const fetchInstructions = async () => {
  //     // const response = await fetch('instructions');
  //     const data = await response.json();
  //     setInstructions(data.instructions);
  //     const selectedInstruction = data.instructions.find((instr: { selected: any; }) => instr.selected);
  //     if (selectedInstruction) {
  //       setSelectedInstruction(selectedInstruction.content);
  //     }
  //   };
  
  //   fetchInstructions();
  // }, []);

  useEffect(() => {
    initChatBot();
  }, [selectedInstruction]);

  const handleFileUpload = () => {
    if (fileInputRef.current?.files) {
      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append('file', file);

      // Use the `fetcher` from Remix to submit the form data
      fetcher.submit(formData, { method: 'post', action: '/upload' });
    }
  };

  useEffect(() => {
    initChatBot();
  }, []);

  useEffect(() => {
    setMessages([
      {
        content: "Hi, I'm your computer science tutor. How can I help you?",
        isUser: false,
      },
    ]);
  }, [assistant]);

  const initChatBot = async () => {
    const openai = new OpenAI({
      apiKey:"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",
      dangerouslyAllowBrowser: true,
    });

    // Create an assistant
    const assistant = await openai.beta.assistants.create({
      name: "Computer Science Tutor",
      instructions: selectedInstruction,
      tools: [{ type: "retrieval" }],
      model: "gpt-4-1106-preview",
    });

    // Create a thread
    const thread = await openai.beta.threads.create();

    setOpenai(openai);
    setAssistant(assistant);
    setThread(thread);
  };

  const createNewMessage = (content: string, isUser: boolean) => {
    const newMessage = new MessageDto(isUser, content);
    return newMessage;
  };

  const handleSendMessage = async () => {
    messages.push(createNewMessage(input, true));
    setMessages([...messages]);
    setInput("");

    // Send a message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: input,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    // Create a response
    let response = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    // Wait for the response to be ready
    while (response.status === "in_progress" || response.status === "queued") {
      console.log("waiting...");
      setIsWaiting(true);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      response = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    setIsWaiting(false);

    // Get the messages for the thread
    const messageList = await openai.beta.threads.messages.list(thread.id);

    // Find the last message for the current run
    const lastMessage = messageList.data
      .filter((message: any) => message.run_id === run.id && message.role === "assistant")
      .pop();

    // Print the last message coming from the assistant
    if (lastMessage) {
      console.log(lastMessage.content[0]["text"].value);
      setMessages([...messages, createNewMessage(lastMessage.content[0]["text"].value, false)]);
    }
  };

  // detect enter key and send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Check if Enter key is pressed without any modifier keys (Shift, Ctrl, Alt)
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault(); // Prevent default action (new line or form submission)
      handleSendMessage(); // Call the function to handle sending the message
    } else if (e.key === 'Enter') {
      // Allow for a new line if Enter is pressed with a modifier key
      // Note: Default behavior will insert a new line, no need to implement it
    }
  };

  const handleAddInstruction = async () => {
    if (newInstruction.trim() !== "") {
      // Example of sending the new instruction to the server
      // await fetch('instructions', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ content: newInstruction }),
      // });
      // Refresh instructions list from the server...
      if (newInstruction.trim() !== "") {
        setInstructions([...instructions, newInstruction]); // Update the instructions list
        setNewInstruction(""); // Clear the new instruction input field
      }
    }
  };

  const handleDeleteInstruction = async (instructionContent: string) => {
    // await fetch(`instructions`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ content: instructionContent }),
    // });
    // Refresh instructions list from the server...
    const filteredInstructions = instructions.filter(instruction => instruction !== instructionContent);
    setInstructions(filteredInstructions); // Update the instructions list
  };

  const newConversation = async () => {
    if (openai && thread) {
      await openai.beta.threads.delete(thread.id); // Delete the current thread
      const newThread = await openai.beta.threads.create(); // Create a new thread
      setThread(newThread); // Update the thread state
    }
      setMessages([]); // Clear the messages array to delete chat history
  };


  return (
    <Container>
      <Grid container direction="column" spacing={2} paddingTop={30} paddingBottom={30}>
        {/* Chat history and user chatbox section */}
        <Grid item style={{ flexGrow: 1 }}>
          <Grid container direction="row" spacing={4}>
            {/* Chat history section */}
            <Grid item xs={6} style={{ height: "600px", overflowY: "auto" }}>
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                <Grid container direction="column" spacing={2}>
                  {messages.map((message, index) => (
                    <Grid item key={index} style={{ textAlign: 'left' }}>
                      <Message key={index} message={message} />
                    </Grid>
                  ))}
                </Grid>
              </div>
            </Grid>
            {/* User chatbox section */}
            <Grid item xs={6} style={{ height: "600px" }}>
              <Grid container direction="column" spacing={2}>
                {/* New message input */}
                <Grid item style={{ flexGrow: 1 }}>
                <TextField
                  label="Type your message"
                  variant="outlined"
                  disabled={isWaiting}
                  fullWidth
                  multiline
                  rows={18}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress} // Use the modified handleKeyPress function here
                />
                  {isWaiting && <LinearProgress color="inherit" />}
                </Grid>
                {/* Upload file and send buttons */}
                <Grid item container justifyContent="space-between" alignItems="center">
                  <Grid item>
                    <fetcher.Form method="post" action="/api/upload" encType="multipart/form-data">
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="file-upload">
                        <Button
                          variant="contained"
                          component="span"
                          color="secondary"
                        >
                          Upload File
                        </Button>
                      </label>
                    </fetcher.Form>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="primary" onClick={handleSendMessage} disabled={isWaiting}>
                      Send
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* Instructions section */}
        <Grid item style={{ marginTop: "30px" }}>
          {userRole === 'professor' && (
            <>
              <FormControl fullWidth>
                <InputLabel id="instruction-select-label">Instruction</InputLabel>
                <Select
                  labelId="instruction-select-label"
                  value={selectedInstruction}
                  onChange={(e) => setSelectedInstruction(e.target.value)}
                  label="Instruction"
                >
                  {instructions.map((instruction, index) => (
                    <MenuItem key={index} value={instruction}>
                      {instruction}
                      <IconButton size="small" onClick={() => handleDeleteInstruction(instruction)} color="error">
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
          {/* Add new instruction text field */}
          <TextField
            label="Add new instruction"
            variant="outlined"
            fullWidth
            value={newInstruction}
            onChange={(e) => setNewInstruction(e.target.value)}
            style={{ marginTop: "20px" }}
          />
          {/* Add instruction button */}
          {userRole === 'professor' && (
            <Button variant="contained" color="primary" onClick={handleAddInstruction} style={{ marginTop: "20px" }}>
              Add Instruction
            </Button>
          )}
        </Grid>
      </Grid>
    </Container>
  );
  
}  
export default Chat;