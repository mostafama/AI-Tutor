// This React functional component renders a message bubble for a chat application.
// It uses the MessageDto type to ensure proper data structure for incoming props.
// The component adjusts the text alignment and bubble color based on whether the message
// was sent by the user (isUser property)

// Author: Jerry Fan
// Date: 4/30/2024

import React from 'react';
import { MessageDto } from "./MessageDto";

interface MessageProps {
  message: MessageDto;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <div style={{ textAlign: message.isUser ? "right" : "left", margin: "8px" }}>
      <div
        style={{
          color: message.isUser ? "#ffffff" : "#000000",
          backgroundColor: message.isUser ? "#1186fe" : "#eaeaea",
          padding: "15px",
          borderRadius: "8px",
        }} // Add a border radius to the message bubble
      >
        {message.content.split("\n").map((text, index) => (
          <>
            {text}
            <br />
          </>
        ))}
      </div>
    </div>
  );
};

export default Message;