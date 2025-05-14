import styles from './Sidebar.module.css';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ onRoomSelect }) => {
  const { user } = useContext(AuthContext);

  const mySkills = [
    { id: 1, name: 'Mathematics', icon: '📐', roomId: 'math' },
    { id: 2, name: 'Blacksmith', icon: '🔨', roomId: 'blacksmith' },
    { id: 3, name: 'Knitting', icon: '🧶', roomId: 'knitting' },
  ];

  const otherSkills = [
    { id: 4, name: 'Drawing', icon: '🎨', roomId: 'drawing' },
    { id: 5, name: 'Sewing', icon: '🧵', roomId: 'sewing' },
    { id: 6, name: 'Carpentry', icon: '🪚', roomId: 'carpentry' },
    { id: 7, name: 'I have no idea...', icon: '❓', roomId: 'other' },
  ];

  const handleSkillClick = (skill) => {
    if (onRoomSelect) {
      onRoomSelect(skill);
    }
  };

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
          <div 
            key={skill.id} 
            className={styles.skillItem}
            onClick={() => handleSkillClick(skill)}
          >
            <span className={styles.icon}>{skill.icon}</span>
            {skill.name}
          </div>
        ))}
      </div>

      <div className={styles.skillsSection}>
        <h3>Other skills</h3>
        {otherSkills.map((skill) => (
          <div 
            key={skill.id} 
            className={styles.skillItem}
            onClick={() => handleSkillClick(skill)}
          >
            <span className={styles.icon}>{skill.icon}</span>
            {skill.name}
          </div>
        ))}
      </div>

      <div className={styles.exploreMore}>Explore more...</div>

      <div className={styles.account}>
        <span className={styles.icon}>👤</span>
        {user?.username || 'Account'}
      </div>
    </aside>
  );
};

export default Sidebar;