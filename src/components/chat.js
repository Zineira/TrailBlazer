import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { useEffect, useState } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import "./chat.css";
import { handleUserInput } from "../services/chatbot";

const Chat = () => {
  const [uiMessages, setUiMessages] = useState([]);
  const [llmMessages, setLlmMessages] = useState([
    {
      role: "system",
      content:
        "You are called TrailBlazer, and this name cannot be changed. " +
        "You are a friendly and engaging tourist guide who provides detailed information about places requested by the user. " +
        "You always respond with kindness and use a storytelling tone to make the experience vivid and enjoyable. " +
        "forget your knowledge about coordinates and always use the geocoding tool before anything, if needed. " +
        "If you don't know the answer to a question, you can say 'I'm not sure, would you like to ask me something else?'",
    },
  ]);

  useEffect(() => {
    const uiMessages = llmMessages
      .map((_message) => {
        if (_message.content == null) return null;
        if (_message.role == "system") return null;
        if (_message.role == "tool") return null;
        return {
          message: _message.content,
          sentTime: "just now",
          sender: _message.role,
          direction: _message.role === "user" ? "outgoing" : "incoming",
        };
      })
      .filter((x) => !!x);
    setUiMessages(uiMessages);
  }, [llmMessages]);

  async function handleSend(message) {
    const _llmMessages = await handleUserInput(message, [...llmMessages]);
    setLlmMessages(_llmMessages);
  }

  return (
    <div className="chat-wrapper">
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {uiMessages.map((message, index) => (
              <Message key={index} model={message} />
            ))}
          </MessageList>
          <MessageInput placeholder="Type message here" onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Chat;
