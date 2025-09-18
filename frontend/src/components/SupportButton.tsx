import "../styles/SupportButton.css";
import { Link } from "react-router-dom";
import { BotMessageSquare } from "lucide-react";

export default function SupportButton() {
  return (
    <>
      <Link to="/soporte" id="support_button">
        <BotMessageSquare className="icon-sky transform -scale-x-100" size={60}/>
      </Link>
    </>  
  )
}