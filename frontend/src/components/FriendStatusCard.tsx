import "../styles/FriendStatusCard.css";
import { useAuthContext } from "../contexts/AuthContext";

type Props = {
  id: string;
  name: string;
  status: "Conectado" | "Ocupado" | "Offline";
  removable?: boolean;
  removeHandler?: () => void;
  acceptHandler?: () => void;
  rejectHandler?: () => void;
};

export default function FriendStatusCard({ id, name, status, removable, removeHandler, acceptHandler, rejectHandler }: Props) {
  return (
    <div className="fstatus">
      <div className="fstatus__left">
        <div className="fstatus__avatar" />
        <div className="fstatus__info">
          <p className="fstatus__name">{name}</p>
          <p className="fstatus__subtitle">Amigo</p>
        </div>
      </div>

      {removable && (
        <button className="btn-ghost" onClick={removeHandler}>
          Eliminar
        </button>
      )}

      {acceptHandler && rejectHandler && (
        <div className="fstatus__actions">
          <button className="btn-primary" onClick={acceptHandler}>Aceptar</button>
          <button className="btn-secondary" onClick={rejectHandler}>Rechazar</button>
        </div>
      )}

      <span className={`badge ${statusClass(status)}`}>{status}</span>
    </div>
  );
}

function statusClass(s: Props["status"]) {
  if (s === "Conectado") return "badge--ok";
  if (s === "Ocupado") return "badge--warn";
  return "badge--muted";
}
