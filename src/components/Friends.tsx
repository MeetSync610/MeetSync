import "../styles/Friends.css";
import PageHeader from "./PageHeader";
import SearchBar from "./SearchBar";
import FriendCard from "./FriendCard";
// import { UserCheck, UserPlus } from "lucide-react";
export default function Friends() {
  return (
    <section className="friends">
      <div className="container">
        <PageHeader
          title="Conexiones / Amigos"
          right={
            <>
              <a href="/schedule" className="btn-primary">Crear horario</a>
              <a href="/sync" className="btn-secondary">Crear sincronización</a>
            </>
          }
        />

        <SearchBar placeholder="Buscar personas..." />

        <div className="friends__list">
          <FriendCard name="Billy" subtitle="Amigo" type="friend" />
          <FriendCard name="Mati" subtitle="Amigo" type="friend" />
          <FriendCard name="Leo" subtitle="Amigo" type="friend" />
          <FriendCard name="Sofi" subtitle="Sugerido" type="suggested" />
          <FriendCard name="Rocha" subtitle="Sugerido" type="suggested" />
        </div>
      </div>
    </section>
  );
}