import styles from "./Login.module.css";
import logo from "../../../assets/images/logo.png";
import { UseLogin } from "../../../Hooks/UseLogin";
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";


const Login = () => {
    const { user } = useContext(AuthContext);

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const {login, error, isLoading} = UseLogin()

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password)
  }
  return (
    <div className={styles.container}>
      <div className={styles.formOne}>
        <div className={styles.loginContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}><img src={logo} alt="logo" /></div>
            <h2>SkillSwap</h2>
          </div>
          <div className={styles.form}>
            <form onSubmit={handleSubmit}>
            {user === undefined && <div className={styles.error}>check you details and try again</div>}
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
              <button type="submit" disabled={isLoading}>Sign In</button>
              <div><a href="/signup">Don t have an account? Sign Up</a></div>
              {error && <div className={styles.error}>{error}</div>}

            </form>
          </div>
        </div>
      </div>
      <div className={styles.formTwo}></div>
    </div>
  );
};

export default Login;