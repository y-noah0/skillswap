import Navigation from '../Defaults/Navigation/Navigation'
import style from './Hero.module.css'
function Hero() {
    return (
        <>
            <Navigation />
            <div className={style.Hero}>
                <h1>Unlock a World of Skills. <br />Start sharing and learning today.</h1>
                <p>Welcome to Skill Swap, where learning and teaching come together in a vibrant community. <br />Discover new skills, share your expertise, and grow alongside others in a supportive environment.</p>
                <button>Get Started</button>
            </div>
        </>
    )
} export default Hero