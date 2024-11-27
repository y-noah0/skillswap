import styles from './Sidebar.module.css';

const Sidebar = () => {
  const mySkills = [
    { id: 1, name: 'Mathematics', icon: '📐' },
    { id: 2, name: 'Blacksmith', icon: '🔨' },
    { id: 3, name: 'Knitting', icon: '🧶' },
  ];

  const otherSkills = [
    { id: 4, name: 'Drawing', icon: '🎨' },
    { id: 5, name: 'Sewing', icon: '🧵' },
    { id: 6, name: 'Carpentry', icon: '🪚' },
    { id: 7, name: 'I have no idea...', icon: '❓' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🔄</span>
        <span>SkillSwap</span>
      </div>

      <div className={styles.menuItem}>
        <span className={styles.icon}>✉</span>
        Direct Messages
      </div>

      <div className={styles.skillsSection}>
        <h3>My skills</h3>
        {mySkills.map((skill) => (
          <div key={skill.id} className={styles.skillItem}>
            <span className={styles.icon}>{skill.icon}</span>
            {skill.name}
          </div>
        ))}
      </div>

      <div className={styles.skillsSection}>
        <h3>Other skills</h3>
        {otherSkills.map((skill) => (
          <div key={skill.id} className={styles.skillItem}>
            <span className={styles.icon}>{skill.icon}</span>
            {skill.name}
          </div>
        ))}
      </div>

      <div className={styles.exploreMore}>Explore more...</div>

      <div className={styles.account}>
        <span className={styles.icon}>👤</span>
        Account
      </div>
    </aside>
  );
};

export default Sidebar;