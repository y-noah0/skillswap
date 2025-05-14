import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useAuthContext } from "../../Hooks/UseAuth"; // Changed import
import Sidebar from "../Sidebar/Sidebar";
import styles from "./Dashboard.module.css";
import welcomeIcon from "../../assets/images/welcome.png";
import io from "socket.io-client";
import { useNavigate, Link } from "react-router-dom";

const socket = io("http://localhost:8800");

const Dashboard = () => {
  const { user, token } = useAuthContext(); // Changed to useAuthContext
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomMembers, setRoomMembers] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [showDirectChat, setShowDirectChat] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [directMessages, setDirectMessages] = useState([]);
  const [newDirectMessage, setNewDirectMessage] = useState("");
  const messagesEndRef = useRef(null);
  const directMessagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollDirectToBottom = () => {
    directMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.emit("join_room", currentRoom?.roomId);
    socket.on("receive_message", (message) => {
      setMessages((prevMessages) => [message, ...prevMessages]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollDirectToBottom();
  }, [directMessages]);

  const handleRoomSelect = useCallback(async (skill) => {
    try {
      await fetch("http://localhost:3000/room/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillId: skill.roomId,
          userId: user._id,
          username: user.username
        }),
      });
    } catch (error) {
      console.error("Error joining room:", error);
    }

    setCurrentRoom(skill);
    setMessages([]);
    setShowDirectChat(false);
    setSelectedMember(null);
  }, [user]);

  const handleSendMessage = async () => {
    if (!currentRoom || !newMessage.trim()) return;

    const messageData = {
      roomId: currentRoom.roomId,
      senderId: user._id,
      sender_name: user.username,
      message: newMessage.trim(),
    };

    socket.emit("send_message", messageData);

    try {
      await fetch("http://localhost:3000/room/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }

    setNewMessage("");
  };

  const handleStartDirectChat = async (member) => {
    if (member.userId === user._id) return; // Don't chat with yourself
    
    setSelectedMember(member);
    setShowDirectChat(true);
    
    try {
      // Find existing chat or create a new one
      const response = await fetch(`http://localhost:3000/chat/find/${user._id}/${member.userId}`);
      let chat = await response.json();
      
      if (!chat) {
        // Create a new chat
        const createResponse = await fetch(`http://localhost:3000/chat/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: user._id,
            receiverId: member.userId
          }),
        });
        
        chat = await createResponse.json();
      }
      
      // Get messages for this chat
      if (chat._id) {
        const messagesResponse = await fetch(`http://localhost:3000/message/${chat._id}`);
        const chatMessages = await messagesResponse.json();
        setDirectMessages(chatMessages);
      } else {
        setDirectMessages([]);
      }
    } catch (error) {
      console.error("Error setting up direct chat:", error);
      setDirectMessages([]);
    }
  };

  const handleSendDirectMessage = async () => {
    if (!selectedMember || !newDirectMessage.trim()) return;
    
    try {
      // Find the chat between these users
      const response = await fetch(`http://localhost:3000/chat/find/${user._id}/${selectedMember.userId}`);
      const chat = await response.json();
      
      if (chat) {
        const messageData = {
          chatId: chat._id,
          senderId: user._id,
          text: newDirectMessage.trim(),
        };
        
        // Send to backend
        const sendResponse = await fetch("http://localhost:3000/message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageData),
        });
        
        if (sendResponse.ok) {
          const newMsg = await sendResponse.json();
          setDirectMessages((prev) => [...prev, newMsg]);
          setNewDirectMessage("");
          
          // Emit message via socket
          socket.emit("send-message", {
            ...newMsg,
            senderUsername: user.username
          });
        }
      }
    } catch (error) {
      console.error("Error sending direct message:", error);
    }
  };

  useEffect(() => {
    // Setup socket for direct messages
    socket.on("receive-message", (message) => {
      if (selectedMember && 
          (message.senderId === selectedMember.userId || 
           message.senderId === user._id)) {
        setDirectMessages((prev) => [...prev, message]);
      }
    });
    
    return () => {
      socket.off("receive-message");
    };
  }, [selectedMember, user._id]);

  useEffect(() => {
    if (currentRoom) {
      socket.emit("join_room", currentRoom.roomId);

      const handleReceiveMessage = (message) => {
        if (message.roomId === currentRoom.roomId) {
          setMessages((prevMessages) => [message, ...prevMessages]);
        }
      };

      const handleMessageEdited = (editedMessage) => {
        if (editedMessage.roomId === currentRoom.roomId) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === editedMessage._id ? editedMessage : msg
            )
          );
        }
      };

      const handleMessageDeleted = (deletedMessage) => {
        if (deletedMessage.roomId === currentRoom.roomId) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === deletedMessage._id ? deletedMessage : msg
            )
          );
        }
      };

      socket.on("receive_message", handleReceiveMessage);
      socket.on("message_edited", handleMessageEdited);
      socket.on("message_deleted", handleMessageDeleted);

      const fetchMembers = async () => {
        try {
          const response = await fetch(`http://localhost:3000/room/members/${currentRoom.roomId}`);
          const members = await response.json();
          setRoomMembers(members);
        } catch (error) {
          console.error("Error fetching members:", error);
        }
      };

      fetchMembers();

      return () => {
        socket.off("receive_message", handleReceiveMessage);
        socket.off("message_edited", handleMessageEdited);
        socket.off("message_deleted", handleMessageDeleted);
      };
    }
  }, [currentRoom]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentRoom) return;

      try {
        const result = await fetch(`http://localhost:3000/room/messages/${currentRoom.roomId}`);
        const messages = await result.json();
        if (Array.isArray(messages)) {
          setMessages(messages);
        } else {
          console.error('Received non-array messages:', messages);
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [currentRoom]);

  const handleEditMessage = async (message) => {
    if (!editText.trim()) return;

    const messageData = {
      roomId: currentRoom.roomId,
      messageId: message._id,
      newMessage: editText.trim()
    };

    try {
      const response = await fetch("http://localhost:3000/room/message/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
        socket.emit("edit_message", { ...updatedMessage, roomId: currentRoom.roomId });
        setEditingMessage(null);
        setEditText("");
      }
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const handleDeleteMessage = async (message) => {
    const messageData = {
      roomId: currentRoom.roomId,
      messageId: message._id
    };

    try {
      const response = await fetch("http://localhost:3000/room/message/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const deletedMessage = await response.json();
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === deletedMessage._id ? deletedMessage : msg
          )
        );
        socket.emit("delete_message", { ...deletedMessage, roomId: currentRoom.roomId });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleInitiateVideoCall = () => {
    if (currentRoom && user) {
      socket.emit("initiate_room_call", {
        roomId: currentRoom.roomId,
        callerName: user.username,
        callerId: user._id,
        callType: "video",
      });
      navigate(`/call/${currentRoom.roomId}`);
    }
  };

  const handleInitiateAudioCall = () => {
    if (currentRoom && user) {
      socket.emit("initiate_room_call", {
        roomId: currentRoom.roomId,
        callerName: user.username,
        callerId: user._id,
        callType: "audio",
      });
      navigate(`/call/${currentRoom.roomId}`);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar onRoomSelect={handleRoomSelect} />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.pageTitle}>
              {showDirectChat && selectedMember 
                ? `Chat with ${selectedMember.username}` 
                : currentRoom 
                  ? currentRoom.name 
                  : 'Select a skill'}
            </div>
            {showDirectChat && selectedMember && (
              <button 
                className={styles.backButton} 
                onClick={() => {
                  setShowDirectChat(false);
                  setSelectedMember(null);
                }}
              >
                Back to Room
              </button>
            )}
          </div>
          <button className={styles.createButton}>Create new skill</button>
        </header>

        <div className={styles.contentArea}>
          {!showDirectChat ? (
            // Room Chat
            <div className={styles.chatArea}>
              <div className={styles.messageBox}>
                <div
                  className={styles.welcomeMessage}
                  style={
                    !currentRoom || messages.length === 0
                      ? { display: "flex", flexDirection: "column" }
                      : { display: "none" }
                  }
                >
                  <img src={welcomeIcon} className={styles.welcomeIcon} />
                  <h2>
                    {currentRoom 
                      ? `Welcome to ${currentRoom.name} Hub`
                      : 'Select a skill to start chatting'}
                  </h2>
                </div>
                <div className={styles.messages}>
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={
                        message.senderId === user._id
                          ? styles.myMessage
                          : styles.theirMessage
                      }
                    >
                      <div className={styles.messageSender}>
                        <span>{message.sender_name}</span>
                        {message.isEdited && <span className={styles.editedBadge}>(edited)</span>}
                      </div>
                      <div className={styles.messageContent}>
                        {editingMessage?._id === message._id ? (
                          <div className={styles.editContainer}>
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className={styles.editInput}
                            />
                            <button onClick={() => handleEditMessage(message)}>Save</button>
                            <button onClick={() => {
                              setEditingMessage(null);
                              setEditText("");
                            }}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <span className={styles.messageText}>{message.message}</span>
                            {message.senderId === user._id && !message.isDeleted && (
                              <div className={styles.messageActions}>
                                <button onClick={() => {
                                  setEditingMessage(message);
                                  setEditText(message.message);
                                }}>✏️</button>
                                <button onClick={() => handleDeleteMessage(message)}>🗑️</button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </div>

              {currentRoom && (
                <div className={styles.messageInput}>
                  <input
                    type="text"
                    placeholder="Say something..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className={styles.boxButtons}>
                    <button
                      className={styles.sendButton}
                      onClick={handleSendMessage}
                    >
                      <span className={styles.sendIcon}>➤</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Direct Message Chat
            <div className={styles.chatArea}>
              <div className={styles.messageBox}>
                <div className={styles.directMessages}>
                  {directMessages.map((message, index) => (
                    <div
                      key={message._id || index}
                      className={
                        message.senderId === user._id
                          ? styles.myMessage
                          : styles.theirMessage
                      }
                    >
                      <div className={styles.messageSender}>
                        <span>{message.senderId === user._id ? user.username : selectedMember.username}</span>
                      </div>
                      <div className={styles.messageContent}>
                        <span className={styles.messageText}>{message.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={directMessagesEndRef} />
              </div>

              <div className={styles.messageInput}>
                <input
                  type="text"
                  placeholder={`Message ${selectedMember?.username}...`}
                  value={newDirectMessage}
                  onChange={(e) => setNewDirectMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendDirectMessage();
                    }
                  }}
                />
                <div className={styles.boxButtons}>
                  <button
                    className={styles.sendButton}
                    onClick={handleSendDirectMessage}
                  >
                    <span className={styles.sendIcon}>➤</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <aside className={styles.membersPanel}>
            <h3>Members</h3>
            <div className={styles.membersList}>
              {roomMembers.map((member) => (
                <div key={member.userId} className={styles.memberItem}>
                  <span>{member.username}</span>
                  <button 
                    className={styles.messageButton}
                    onClick={() => handleStartDirectChat(member)}
                    disabled={member.userId === user._id}
                  >
                    ✉
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
