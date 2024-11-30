import { Link, useNavigate } from 'react-router-dom';
import style from './Navigation.module.css';
import logo from '../../../assets/images/logo.png';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { UseLogout } from '../../../Hooks/UseLogout';

function Navigation() {
    const navigate = useNavigate();
    const { logout } = UseLogout();
    const { user } = useContext(AuthContext);

  console.log(user)
    const handleClick = () => {
        logout();
    }

    return (
        <div className={`${style.Navigation} ${user ? style.authenticatedNav : ''}`}>
            <div className={style.logo} onClick={() => navigate('/')}>
                <img src={logo} alt="Logo" />
                <h2>SkillSwap</h2>
            </div>
            <nav className={style.buttons}>
                {user && (
                    <div className={style.userInfo}>
                        <span className={style.userEmail}>{user.email}</span>
                        <button 
                            className={style.logoutBtn}
                            onClick={handleClick}
                        >
                            Log out
                        </button>
                    </div>
                )}
                {!user && (
                    <div>
                        <Link to="/login">
                            <button className={style.signIn}>
                                Sign In
                            </button>
                        </Link>
                        <Link to="/signup">
                            <button className={style.signUp}>
                                Sign Up
                            </button>
                        </Link>
                    </div>
                )}
            </nav>
        </div>
    );
}

export default Navigation;