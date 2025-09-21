import "../styles/FriendCard.css";
import { UserCheck, UserPlus } from "lucide-react";

type FriendCardProps = {
  name: string;
  isFriend: boolean;
};

export default function FriendCard({ name, isFriend }: FriendCardProps) {

  let subtitle = isFriend? "Amigo" : "Sugerido";

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
        {isFriend? (
          <span className="badge"><UserCheck/></span>
        ) : (
          <button className="btn-ghost"><UserPlus/></button>
        )}
      </div>
    </div>
  );
}