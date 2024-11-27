import Sidebar from "../Sidebar/Sidebar";
import styles from "./Dashboard.module.css";
import welcomeIcon from "../../assets/images/Welcome.png";
import messageImage from "../../assets/sampleMessageImage.jpg";

const Dashboard = () => {
  const members = [
    { id: 1, name: "Chiomilol" },
    { id: 2, name: "Arsene" },
    { id: 3, name: "Noah101" },
    { id: 4, name: "Enock360" },
  ];
  const sender_id = "32befj";
  const messages = [
    {
      message_id: 1,
      sender_id: "32befj",
      sender_name: "Arsene",
      content: "Hello",
    },
    {
      message_id: 2,
      sender_id: "32fwr",
      sender_name: "Chlomi",
      content: "Hyy",
    },
    {
      message_id: 3,
      sender_id: "6sif7",
      sender_name: "Enock",
      content: "I'm flight",
      Image: `${messageImage}`
    },
  ];

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
            <div className={styles.welcomeMessage}>
              <img src={welcomeIcon} className={styles.welcomeIcon} />
              <h2>Welcome to Mathematics Hub</h2>
            </div>
            <div className={styles.messages}>
              {messages.map((message) => (
                <div
                  key={message.message_id}
                  className={
                    message.sender_id === sender_id
                      ? styles.myMessage
                      : styles.theirMessage
                  }
                >
                  <div className={styles.messageSender}>
                    <span>{message.sender_name}</span>
                  </div>
                  <div className={styles.messageContent}>{message.content}</div>
                  <div className={styles.messageImage}>
                    {message.Image && <img src={message.Image} />}  
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.messageInput}>
              <input type="text" placeholder="Say something..." />
              <div className={styles.boxButtons}>
                <button className={styles.sendButton}>
                  <span className={styles.sendIcon}>📎</span>
                </button>
                <button className={styles.sendButton}>
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
