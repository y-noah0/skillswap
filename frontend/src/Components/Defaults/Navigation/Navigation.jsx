import { useNavigate } from 'react-router-dom';
import style from './Navigation.module.css';
import logo from '../../../assets/images/logo.png';

function Navigation() {
    const navigate = useNavigate();

    return (
        <div className={style.Navigation}>
            <div className={style.logo} onClick={() => navigate('/')}>
                <img src={logo} alt="" />
                <h2>SkillSwap</h2>
            </div>
            <div className={style.buttons}>
                <button 
                    className={style.signIn}
                    onClick={() => navigate('/login')}
                >
                    Sign in
                </button>
                <button 
                    className={style.signUp}
                    onClick={() => navigate('/signup')}
                >
                    Sign up
                </button>
            </div>
        </div>
    );
}

export default Navigation;