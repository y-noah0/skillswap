import React from "react";
import styles from "./Login.module.css";
import logo from "../../../assets/images/logo.png";

const Login = () => {
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
              <button type="submit">Sign In</button>
            </form>
          </div>
        </div>
      </div>
      <div className={styles.formTwo}></div>
    </div>
  );
};

export default Login;