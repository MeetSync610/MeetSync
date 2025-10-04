import { useState, useEffect } from "react";
import "../styles/Friends.css";
import PageHeader from "./PageHeader";
import SearchBar from "./SearchBar";
import FriendCard from "./FriendCard";
// import { UserCheck, UserPlus } from "lucide-react";

export type user = {
  name: string,
  username: string,
  isFriend: boolean,
}

export default function Friends() {

  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState([{name: "buscado", username: "buscado", isFriend: true}, {name: "man", username: "man", isFriend: true}]);
  const [searching, setSearching] = useState(false);

  useEffect( () => {
    fetch(`http://localhost:3000/api/friends/1`)
     .then((res) => res.json())
     .then((data) => setFriends(data))
     .catch((err) => console.error("Error al traer amigos:", err));
  }, [])

  const handleSearch = async (user: string) => {
    if(!user) {
      setSearch([]);
      setSearching(false);
    } else try {
      const responde = await fetch(`http://localhost:3000/api/friends?name=${user}`);
      if(!responde.ok) {
        throw new Error("Persona no Encontrada");
      }
      const data = await responde.json();
      setSearch(data);
      setSearching(true);
    } catch (err) {
      console.log("Error al buscar amigos:", err);
    }
  }

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

        <SearchBar placeholder="Buscar personas..." onChange={handleSearch}/>
        
        <div className="friends__list">
          {searching && search.map((res: user, i) => (<FriendCard key={i} name={res.name} isFriend={res.isFriend} />))}
          {/* !searching && friends.map((frn: user, i) => (<FriendCard key={i} name={frn.name} isFriend={true} />)) */}
        </div>
      </div>
    </section>
  );
}