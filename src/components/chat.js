import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { useEffect, useState } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageHtmlContent,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import "./chat.css";
import { handleUserInput } from "../services/chatbot";
import ReactMarkdown from "react-markdown";

const Chat = (props) => {
  const [waiting, setWaiting] = useState(false);
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

  useEffect(() => {
    let markers = [];
    for (const message of llmMessages) {
      if (message.role != "tool") continue;
      const toolResponse = JSON.parse(message.content);
      if (!toolResponse.places) continue;
      markers = toolResponse.places.map((place) => {
        return {
          id: place.id,
          position: {
            lat: place.location.latitude,
            lng: place.location.longitude,
          },
          title: place.displayName.text,
        };
      });
    }
    const setMarkers = props.setMarkers;
    setMarkers(markers);
  }, [props.setMarkers, llmMessages]);

  useEffect(() => {
    if (llmMessages.length === 0) return;
    const lastMessage = llmMessages[llmMessages.length - 1];
    setWaiting(lastMessage.role === "user");
  }, [llmMessages]);

  async function handleSend(content) {
    let _llmMessages = [...llmMessages, { role: "user", content }];
    setLlmMessages(_llmMessages);
    _llmMessages = await handleUserInput([..._llmMessages]);
    setLlmMessages(_llmMessages);
  }

  const loading = uiMessages.length > 0 && waiting;
  return (
    <div className="chat-wrapper">
      <MainContainer>
        <ChatContainer>
          <MessageList
            autoScrollToBottom={true}
            scrollBehavior="smooth"
            loadingMore={loading}
            loadingMorePosition="bottom"
          >
            {uiMessages.map((message, index) => (
              <Message.CustomContent key={index} model={message}>
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      message.sender == "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      backgroundColor:
                        message.sender == "user" ? "#6ea9d7" : "#c6e3fa",
                      padding: "5px",
                      marginTop: "5px",
                      marginBottom: "5px",
                      borderRadius:
                        message.sender == "user"
                          ? ".7em 0 0 .7em"
                          : "0 .7em .7em 0",
                      textAlign: "left",
                      fontSize: "12px",
                      maxWidth: "80%",
                      display: "left",
                    }}
                  >
                    <ReactMarkdown
                      components={{
                        ol: ({ node, ...props }) => (
                          <ol
                            style={{ marginLeft: "20px", paddingLeft: "0" }}
                            {...props}
                          />
                        ),
                      }}
                    >
                      {message.message}
                    </ReactMarkdown>
                  </div>
                </div>
              </Message.CustomContent>
            ))}
            {loading && (
              <Message
                style={{
                  fontSize: "12px",
                }}
                model={{
                  message: "🤖 Thinking...",
                  direction: "incoming",
                }}
              />
            )}
          </MessageList>
          <MessageInput placeholder="Type message here" onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Chat;
