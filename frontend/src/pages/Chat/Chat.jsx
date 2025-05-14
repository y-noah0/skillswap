import { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import io from "socket.io-client";
import "./Chat.css";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const socket = useRef();
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);

  // Connect to socket server
  useEffect(() => {
    socket.current = io("http://localhost:8800");
    
    // Listen for incoming messages
    socket.current.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    
    // Listen for typing updates
    socket.current.on("typing-update", (data) => {
      if (currentChat && data.chatId === currentChat._id) {
        setTypingUsers(data.typingUsers);
      }
    });
    
    // Listen for message read updates
    socket.current.on("message-read-update", (data) => {
      if (currentChat && data.chatId === currentChat._id) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, readBy: [...msg.readBy, data.userId] }
              : msg
          )
        );
      }
    });
    
    return () => {
      socket.current.disconnect();
    };
  }, [currentChat]);

  // Add user to socket.io when component mounts
  useEffect(() => {
    if (user) {
      socket.current.emit("new-user-add", user._id);
      
      // Listen for online users
      socket.current.on("get-users", (users) => {
        setOnlineUsers(users);
      });
    }
  }, [user]);

  // Fetch user's conversations
  useEffect(() => {
    const getConversations = async () => {
      try {
        const response = await fetch(`http://localhost:3000/chat/${user._id}`);
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    
    if (user) {
      getConversations();
    }
  }, [user]);

  // Fetch messages when current chat changes
  useEffect(() => {
    const getMessages = async () => {
      try {
        if (currentChat) {
          const response = await fetch(`http://localhost:3000/message/${currentChat._id}`);
          if (response.ok) {
            const data = await response.json();
            setMessages(data);
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    if (currentChat) {
      getMessages();
    } else {
      setMessages([]);
    }
  }, [currentChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !file) || !currentChat) return;
    
    try {
      const messageData = {
        chatId: currentChat._id,
        senderId: user._id,
        text: newMessage,
      };
      
      // If there's a file to upload
      if (file) {
        // In a real app, you would upload the file to a server/CDN
        // For this example, we'll simulate a successful upload
        const fileType = file.type.startsWith('image/') ? 'image' : 'file';
        
        messageData.mediaType = fileType;
        messageData.fileName = file.name;
        messageData.fileSize = file.size;
        messageData.mediaUrl = URL.createObjectURL(file); // In a real app, this would be the CDN URL
      }
      
      // Send to server
      const response = await fetch("http://localhost:3000/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data]);
        setNewMessage("");
        setFile(null);
        setFilePreview(null);
        
        // Send message to socket
        socket.current.emit("send-message", data);
        
        // Clear typing indication
        setIsTyping(false);
        socket.current.emit("typing", {
          chatId: currentChat._id,
          userId: user._id,
          isTyping: false,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      socket.current.emit("typing", {
        chatId: currentChat._id,
        userId: user._id,
        isTyping: true,
      });
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.current.emit("typing", {
        chatId: currentChat._id,
        userId: user._id,
        isTyping: false,
      });
    }, 2000);
  };

  // Function to check if a user is online
  const isUserOnline = (userId) => {
    return onlineUsers.some((user) => user.userId === userId);
  };

  // Function to get other user in conversation (assuming 1-1 chats)
  const getOtherUser = (conversation) => {
    if (!conversation || !conversation.members) {
      return "Unknown";
    }
    const otherUser = conversation.members.find((member) => member !== user._id);
    return otherUser || "Unknown";
  };

  return (
    <div className="chat-container">
      <div className="chat-menu">
        <div className="chat-menu-wrapper">
          <h2>Conversations</h2>
          {conversations.map((c) => (
            <div
              key={c._id}
              className={`conversation ${currentChat?._id === c._id ? 'active' : ''}`}
              onClick={() => setCurrentChat(c)}
            >
              <div className="conversation-img">
                {/* In a real app, you'd have user profiles with images */}
                <div className="avatar">{getOtherUser(c).substring(0, 2)}</div>
                {isUserOnline(getOtherUser(c)) && <div className="online-badge"></div>}
              </div>
              <span className="conversation-name">{getOtherUser(c)}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="chat-box">
        {currentChat ? (
          <>
            <div className="chat-box-header">
              <div className="chat-user-info">
                <div className="avatar">{getOtherUser(currentChat).substring(0, 2)}</div>
                <span>{getOtherUser(currentChat)}</span>
                {isUserOnline(getOtherUser(currentChat)) && <div className="online-status">Online</div>}
              </div>
            </div>
            
            <div className="chat-box-messages">
              {messages.map((message, i) => (
                <div 
                  key={i} 
                  className={`message ${message.senderId === user._id ? 'own' : ''}`}
                  ref={i === messages.length - 1 ? scrollRef : null}
                >
                  <div className="message-content">
                    {message.text && <p>{message.text}</p>}
                    
                    {message.mediaType === 'image' && (
                      <img 
                        src={message.mediaUrl} 
                        alt="Message attachment" 
                        className="message-image"
                      />
                    )}
                    
                    {message.mediaType === 'file' && (
                      <div className="message-file">
                        <i className="fas fa-file"></i>
                        <span>{message.fileName}</span>
                        <span className="file-size">
                          {Math.round(message.fileSize / 1024)} KB
                        </span>
                      </div>
                    )}
                    
                    <div className="message-bottom">
                      <div className="message-timestamp">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      
                      {message.senderId === user._id && (
                        <div className="read-status">
                          {message.readBy?.includes(getOtherUser(currentChat)) ? (
                            <i className="fas fa-check-double read"></i>
                          ) : (
                            <i className="fas fa-check sent"></i>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {typingUsers?.length > 0 && typingUsers.some(id => id !== user._id) && (
                <div className="typing-indicator">
                  <span>Someone is typing</span>
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="chat-box-input">
              {filePreview && (
                <div className="file-preview">
                  {file?.type.startsWith('image/') ? (
                    <img src={filePreview} alt="Selected file" />
                  ) : (
                    <div className="file-info">
                      <i className="fas fa-file"></i>
                      <span>{file?.name}</span>
                    </div>
                  )}
                  <button onClick={() => {
                    setFile(null);
                    setFilePreview(null);
                  }} className="remove-file">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="input-form">
                <label htmlFor="file-input" className="file-input-label">
                  <i className="fas fa-paperclip"></i>
                </label>
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleTyping}
                />
                
                <button type="submit" className="send-button">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="no-conversation-text">
            <span>Select a conversation to start chatting</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 