// Define the MessageDto class, which is used to represent a message in the chat feature.

// Author: Jerry Fan
// Date: 4/30/2024

export class MessageDto {
  isUser: boolean;
  content: string;

  constructor(isUser: boolean, content: string) {
    this.isUser = isUser;
    this.content = content;
  } // Create a new message with the provided user status and content
};
