import "../styles/Footer.css";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <img src={logo} className="footer__img" alt="MeetSync logo" />
          <div className="footer__copy">© 2025 MeetSync ·</div>
        </div>
        <div className="footer__links">
          <a href="https://instagram.com/leomessi" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://x.com/leomessisite" target="_blank" rel="noopener noreferrer">X</a>
          <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer">Discord</a>
          <a href="mailto:meetsync25@gmail.com">Mail</a>
        </div>
        <div className="footer__legal">
          <Link to="/terminos">Términos de servicio </Link>
          <Link to="/privacidad">Política de privacidad</Link>
        </div>
      </div>
    </footer>
  );
}