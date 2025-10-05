import { useState } from "react";
import "../styles/Friends.css";
import PageHeader from "./PageHeader";
import SearchBar from "./SearchBar";
import FriendCard from "./FriendCard";
import FriendStatusCard from "./FriendStatusCard";
import { useAuthContext } from "../contexts/AuthContext";
import { supabase } from "../supabaseClient"; // asegúrate de importar Supabase aquí

export default function Friends() {
  const { 
    friends, 
    userProfile, 
    allProfiles, 
    pendingFriendRequests, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    removeFriend,
    loadFriends,               
    loadPendingFriendRequests  
  } = useAuthContext();

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // -------------------- Búsqueda --------------------
  const handleSearch = (query: string) => {
    if (!query) {
      setSearching(false);
      setSearchResults([]);
      return;
    }

    const results = allProfiles
      .filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.username.toLowerCase().includes(query.toLowerCase())
      )
      .filter(p => p.id !== userProfile?.id);

    setSearchResults(results);
    setSearching(true);
  };

  // -------------------- Enviar solicitud --------------------
  const handleSendRequest = async (friendId: string) => {
    if (!userProfile?.id) return;

    try {
      await sendFriendRequest(friendId);

      // 🔄 Refrescar solicitudes y amigos
      await loadPendingFriendRequests(userProfile.id);
      await loadFriends(userProfile.id);

    } catch (err: any) {
      alert(err.message);
    }
  };

  // -------------------- Aceptar solicitud --------------------
  const handleAccept = async (requestId: string) => {
    if (!userProfile?.id) return;

    try {
      await acceptFriendRequest(requestId);

      // 🔄 Refrescar solicitudes y amigos
      await loadPendingFriendRequests(userProfile.id);
      await loadFriends(userProfile.id);

    } catch (err: any) {
      alert(err.message);
    }
  };

  // -------------------- Rechazar solicitud --------------------
  const handleReject = async (requestId: string) => {
    if (!userProfile?.id) return;

    try {
      await rejectFriendRequest(requestId);

      // 🔄 Refrescar solicitudes pendientes
      await loadPendingFriendRequests(userProfile.id);

    } catch (err: any) {
      alert(err.message);
    }
  };

  // -------------------- Eliminar amigo --------------------
  const handleRemoveFriend = async (friendId: string) => {
    if (!userProfile?.id) return;
    const userId = userProfile.id;

    try {
      // 1️⃣ Eliminar de la tabla friends
      await supabase
        .from("friends")
        .delete()
        .or(
          `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
        );

      // 2️⃣ Actualizar la solicitud original a 'rejected' para poder volver a enviar
      await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`
        );

      // 3️⃣ Refrescar las listas de amigos y solicitudes pendientes
      await loadFriends(userId);
      await loadPendingFriendRequests(userId);

      alert("Amigo eliminado correctamente.");

    } catch (err: any) {
      console.error("Error al eliminar amigo:", err.message);
      alert("Error al eliminar amigo: " + err.message);
    }
  };

  // -------------------- Función auxiliar --------------------
  const getRequestStatus = (profileId: string) => {
    return pendingFriendRequests.find(r =>
      (r.sender_id === userProfile?.id && r.receiver_id === profileId) ||
      (r.sender_id === profileId && r.receiver_id === userProfile?.id)
    ) || null;
  };

  // -------------------- Render --------------------
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

        <SearchBar placeholder="Buscar personas..." onChange={handleSearch} />

        {/* ---------- Resultados de búsqueda ---------- */}
        {searching && (
          <div className="friends__search-results">
            {searchResults.map(profile => {
              const isFriend = friends.some(f => f.id === profile.id);
              const request = getRequestStatus(profile.id);
              const isPending = !!(request && request.status === "pending");

              return (
                <FriendCard
                  key={profile.id}
                  name={profile.name}
                  isFriend={isFriend}
                  isPending={isPending}
                  onAdd={() => handleSendRequest(profile.id)}
                />
              );
            })}
          </div>
        )}

        {/* ---------- Solicitudes pendientes ---------- */}
        <h3 className="profile__title">Solicitudes de amistad</h3>
        {pendingFriendRequests.filter(r => r.receiver_id === userProfile?.id).length > 0 ? (
          pendingFriendRequests
            .filter(r => r.receiver_id === userProfile?.id)
            .map(req => {
              const profile = allProfiles.find(p => p.id === req.sender_id);
              if (!profile) return null;

              return (
                <FriendStatusCard
                  key={req.id}
                  id={req.id}
                  name={profile.name}
                  status="Conectado"
                  acceptHandler={() => handleAccept(req.id)}
                  rejectHandler={() => handleReject(req.id)}
                />
              );
            })
        ) : (
          <p>No tienes solicitudes pendientes</p>
        )}

        {/* ---------- Amigos ---------- */}
        <h3 className="profile__title">Tus amigos</h3>
        <div className="profile__friends">
          {friends.length > 0 ? (
            friends.map(friend => (
              <FriendStatusCard
                key={friend.id}
                id={friend.id}
                name={friend.name}
                status="Conectado"
                removable={true}
                removeHandler={() => handleRemoveFriend(friend.id)}
              />
            ))
          ) : (
            <p>No tienes amigos agregados</p>
          )}
        </div>
      </div>
    </section>
  );
}
