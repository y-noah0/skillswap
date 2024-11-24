import style from './Navigation.module.css'
import logo from '../../../assets/images/logo.png'
function Navigation(){
    return(
     <div className={style.Navigation}>  
        <div className={style.logo}>
            <img src={logo} alt="" />
            <h2>SkillSwap</h2>
        </div>
        <div className={style.buttons}>
            <button className={style.signIn}>Sign In</button>
            <button className={style.signUp}>Sign Up</button>
        </div>
     </div>   
    )
}
export default Navigation