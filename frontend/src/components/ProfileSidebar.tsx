import "../styles/ProfileSidebar.css";
import { Calendar, Link as LinkIcon, Users } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  name: string;
  subtitle?: string;
};

export default function ProfileSidebar({ name, subtitle = "Usuario de prueba" }: Props) {
  return (
    <aside className="pside">
      <div className="pside__head">
        <div className="pside__avatar" />
        <div className="pside__info">
          <h2>{name}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="pside__actions">
        <Link to="/schedule" className="btn-primary pside__btn">
          <Calendar size={18} /> Crear horario
        </Link>
        <Link to="/sync" className="btn-outline pside__btn">
          <LinkIcon size={18} /> Crear sincronización
        </Link>
        <Link to="/friends" className="btn-outline pside__btn">
          <Users size={18} /> Ver amigos
        </Link>
      </div>
    </aside>
  );
}
