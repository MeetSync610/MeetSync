import "../styles/Profile.css";
import ProfileSidebar from "./ProfileSidebar";
import FriendStatusCard from "./FriendStatusCard";
import { useAuthContext } from "../contexts/AuthContext";

export default function Profile() {
  const { 
    session, 
    userProfile, 
    friends, 
    pendingFriendRequests, 
    allProfiles, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    removeFriend 
  } = useAuthContext();

  if (!session) {
    return (
      <section className="profile">
        <div className="container">
          <p>Debes iniciar sesión para ver tu perfil y amigos.</p>
        </div>
      </section>
    );
  }

  const getProfileFromRequest = (req: any) => {
    const otherId = req.sender_id === userProfile?.id ? req.receiver_id : req.sender_id;
    return allProfiles.find(p => p.id === otherId) || null;
  };

  // Solicitudes recibidas
  const receivedRequests = pendingFriendRequests.filter(r => r.receiver_id === userProfile?.id);

  return (
    <section className="profile">
      <div className="container">
        <div className="profile__grid">
          <div className="profile__left">
            {userProfile && <ProfileSidebar name={userProfile.name} subtitle={`@${userProfile.username}`} />}
          </div>

          <div className="profile__right">
            {/* ---------- Solicitudes pendientes ---------- */}
            <h3 className="profile__title">Solicitudes de amistad</h3>
            {receivedRequests.length > 0 ? (
              receivedRequests.map(req => {
                const profile = getProfileFromRequest(req);
                if (!profile) return null;

                return (
                  <FriendStatusCard
                    key={req.id}
                    id={req.id}
                    name={profile.name}
                    status="Conectado"
                    removable={false}
                    acceptHandler={() => acceptFriendRequest(req.id)}
                    rejectHandler={() => rejectFriendRequest(req.id)}
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
                    removeHandler={() => removeFriend(friend.id)}
                  />
                ))
              ) : (
                <p>No tienes amigos agregados</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
