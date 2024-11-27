import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const members = [
    { id: 1, name: 'Chiomilol' },
    { id: 2, name: 'Arsene' },
    { id: 3, name: 'Noah101' },
    { id: 4, name: 'Enock360' },
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
              <div className={styles.welcomeIcon}>
                {/* You can replace this with an actual icon */}
                <div className={styles.iconPlaceholder}></div>
              </div>
              <h2>Welcome to Mathematics Hub</h2>
            </div>

            <div className={styles.messageInput}>
              <input type="text" placeholder="Say something..." />
              <button className={styles.sendButton}>
                <span className={styles.sendIcon}>➤</span>
              </button>
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