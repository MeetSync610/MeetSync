import "../styles/FriendStatusCard.css";

type Props = {
  name: string;
  status: "Conectado" | "Ocupado" | "Offline";
};

export default function FriendStatusCard({ name, status }: Props) {
  return (
    <div className="fstatus">
      <div className="fstatus__left">
        <div className="fstatus__avatar" />
        <div className="fstatus__info">
          <p className="fstatus__name">{name}</p>
          <p className="fstatus__subtitle">Amigo</p>
        </div>
      </div>
      <span className={`badge ${statusClass(status)}`}>{status}</span>
    </div>
  );
}

function statusClass(s: Props["status"]) {
  if (s === "Conectado") return "badge--ok";
  if (s === "Ocupado") return "badge--warn";
  return "badge--muted"; // Offline
}
