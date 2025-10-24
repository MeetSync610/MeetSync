import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import "../styles/Login2.css";

export default function Login2() {
  return (
    <section className="login2">
      {/* Video de fondo + overlay, igual que tu HTML */}
      <video
        className="bg-video"
        src="/fondo4k.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="bg-overlay" />

      <div className="login-container">
        <form action="#" onSubmit={(e)=>e.preventDefault()}>
          {/* checkbox que controla el glow de títulos/inputs como en tu HTML */}
          <input type="checkbox" className="input-check" id="input-check" />

          {/* barra de luz superior (queda aunque tu CSS no lo use) */}
          <div className="login-light"></div>

          <h2>Login</h2>

          {/* Email */}
          <div className="input-box">
            <Mail className="icon" size={20} />
            <input type="email" required placeholder=" " />
            <label>Email</label>
            <div className="input-line"></div>
          </div>

          {/* Password */}
          <div className="input-box">
            <Lock className="icon" size={20} />
            <input type="password" required placeholder=" " />
            <label>Password</label>
            <div className="input-line"></div>
          </div>

          <div className="forgot">
            <Link to="/soporte">Forgot Password?</Link>
          </div>

          <button type="submit">Login</button>

          <div className="register-link">
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
