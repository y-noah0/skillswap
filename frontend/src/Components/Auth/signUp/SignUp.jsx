import React, { useState } from "react";
import styles from "./signUp.module.css";
import logo from "../../../assets/images/logo.png";
import { useSignUp } from "../../../Hooks/UseSignup";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [skill, setSkill] = useState("");
  const [desiredSkill, setDesiredSkill] = useState("");

  const { signUp, error, isloading } = useSignUp();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await signUp({
      username,
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      skill,
      desired_skill: desiredSkill,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.formOne}>
        <div className={styles.loginContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <img src={logo} alt="logo" />
            </div>
            <h2>SkillSwap</h2>
          </div>
          <div className={styles.form}>
            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Username:</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>First Name:</label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  onChange={(e) => setFirstName(e.target.value)}
                  value={firstName}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Last Name:</label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  onChange={(e) => setLastName(e.target.value)}
                  value={lastName}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Password:</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Skill:</label>
                <select onChange={(e) => setSkill(e.target.value)} value={skill}>
                  <option value="">Select your skill</option>
                  <option value="programming">hy</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="writing">Writing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Desired Skill:</label>
                <select
                  onChange={(e) => setDesiredSkill(e.target.value)}
                  value={desiredSkill}
                >
                  <option value="">Select desired skill</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="writing">Writing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button type="submit" disabled={isloading}>
                Sign Up
              </button>
              {error && <div className="error">{error}</div>}
            </form>
          </div>
        </div>
      </div>
      <div className={styles.formTwo}></div>
    </div>
  );
};

export default SignUp;
