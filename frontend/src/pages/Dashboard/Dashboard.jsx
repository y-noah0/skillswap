import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../Sidebar/Sidebar";
import styles from "./Dashboard.module.css";
import welcomeIcon from "../../assets/images/Welcome.png";
import { AuthContext } from "../../context/AuthContext";
import io from "socket.io-client";

const socket = io("http://localhost:8800");

const Dashboard = () => {
    const members = [
      { id: 1, name: "Chiomilol" },
      { id: 2, name: "Arsene" },
      { id: 3, name: "Noah101" },
      { id: 4, name: "Enock360" },
    ];

  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const roomId = "6748cc78d8f6b8b11e6eeada"; // Replace with actual roomId

  useEffect(() => {
    socket.emit("join_room", roomId);

    socket.on("receive_message", (message) => {
      setMessages((prevMessages) => [message, ...prevMessages]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [roomId]);

  const handleSendMessage = async () => {
    const messageData = {
      roomId,
      senderId: user._id,
      message: newMessage,
    };

    socket.emit("send_message", messageData);

    // Save message to the database
    await fetch("http://localhost:3000/room/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    }).catch((error) => console.error(error));

    setNewMessage("");
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.pageTitle}>Mathematics</div>
          <button className={styles.createButton}>Create new skill</button>
        </header>

        <div className={styles.contentArea}>
          <div className={styles.chatArea}>
            <div className={styles.messageBox}>
              <div
                className={styles.welcomeMessage}
                style={
                  messages.length === 0
                    ? { display: "flex", flexDirection: "column" }
                    : { display: "none" }
                }
              >
                <img src={welcomeIcon} className={styles.welcomeIcon} />
                <h2>Welcome to Mathematics Hub</h2>
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
                    </div>
                    <div className={styles.messageContent}>{message.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.messageInput}>
              <input
                type="text"
                placeholder="Say something..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
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
          </div>

          <aside className={styles.membersPanel}>
            <h3>Members</h3>
            <div className={styles.membersList}>
              {members.map((member) => (
                <div key={member.id} className={styles.memberItem}>
                  <span>{member.name}</span>
                  <button className={styles.messageButton}>✉</button>
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
