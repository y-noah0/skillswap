import styles from './Features.module.css';

const Features = () => {
  const features = [
    {
      title: "Messaging and Communication",
      description: "Real-time Messaging Service and convenient communication between users to arrange skill swaps and share resources."
    },
    {
      title: "Security and Privacy",
      description: "We take security and convenient communication between users to arrange skill swaps and share resources."
    },
    {
      title: "Community Support",
      description: "Forums and Community Spaces, Areas where users can share their learning experiences, and support each other's learning journey."
    },
    {
      title: "Skill categories",
      description: "A wide range of categories from cooking and coding to photography and fitness, covering all interests."
    },
    {
      title: "Skill categories",
      description: "A wide range of categories from cooking and coding to photography and fitness, covering all interests."
    },
    {
      title: "Skill categories",
      description: "A wide range of categories from cooking and coding to photography and fitness, covering all interests."
    }
  ];

  return (
    <div className={styles.featuresContainer}>
      <div className={styles.header}>
        <h2>Features</h2>
        <p>These are supposed to be the features. To please pick them on I can put them here</p>
      </div>
      
      <div className={styles.featuresGrid}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <div className={styles.iconPlaceholder}></div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;