import "../styles/FriendCard.css";
import { UserCheck, UserPlus, Clock } from "lucide-react";

type FriendCardProps = {
  name: string;
  isFriend: boolean;
  isPending?: boolean;
  onAdd?: () => void;
};

export default function FriendCard({ name, isFriend, isPending, onAdd }: FriendCardProps) {
  let subtitle = isFriend ? "Amigo" : isPending ? "Pendiente" : "Sugerido";

  return (
    <div className="fcard">
      <div className="fcard__left">
        <div className="fcard__avatar" />
        <div className="fcard__info">
          <p className="fcard__name">{name}</p>
          <p className="fcard__subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="fcard__right">
        {isFriend ? (
          <span className="badge"><UserCheck /></span>
        ) : isPending ? (
          <span className="badge"><Clock /></span>
        ) : (
          <button className="btn-ghost" onClick={onAdd}>
            <UserPlus />
          </button>
        )}
      </div>
    </div>
  );
}
