import React from "react";
import styles from "./signUp.module.css";
import logo from "../../../assets/images/logo.png";

const SignUp = () => {
  return (
    <div className={styles.container}>
      <div className={styles.formOne}>
        <div className={styles.loginContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}><img src={logo} alt="logo" /></div>
            <h2>SkillSwap</h2>
          </div>
          <div className={styles.form}>
            <form>
              <div className={styles.inputGroup}>
                <label>Email:</label>
                <input type="email" placeholder="john@example.com" />
              </div>
              <div className={styles.inputGroup}>
                <label>Password:</label>
                <input type="password" placeholder="••••••••••••" />
              </div>
              <div className={styles.inputGroup}>
                <label>Skill:</label>
                <select>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="writing">Writing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button type="submit">Sign Up</button>
            </form>
          </div>
        </div>
      </div>
      <div className={styles.formTwo}></div>
    </div>
  );
};

export default SignUp;
