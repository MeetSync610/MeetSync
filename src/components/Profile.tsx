import "../styles/Profile.css";
import ProfileSidebar from "./ProfileSidebar";
import FriendStatusCard from "./FriendStatusCard";

export default function Profile() {
  return (
    <section className="profile">
      <div className="container">
        <div className="profile__grid">
          <div className="profile__left">
            <ProfileSidebar name="Thiago" subtitle="Usuario de prueba" />
          </div>

          <div className="profile__right">
            <h3 className="profile__title">Tus amigos</h3>
            <div className="profile__friends">
              <FriendStatusCard name="Billy" status="Conectado" />
              <FriendStatusCard name="Mati" status="Ocupado" />
              <FriendStatusCard name="Leo" status="Offline" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
