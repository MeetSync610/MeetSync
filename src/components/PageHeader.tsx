import "../styles/PageHeader.css";
import { UserSearchIcon } from "lucide-react";

type Props = {
  title: string;
  right?: React.ReactNode; // botones u otro contenido a la derecha
};

export default function PageHeader({ title, right }: Props) {
  return (
    <div className="pagehdr">
      <h1> <UserSearchIcon/> {title}</h1>
      <div className="pagehdr__right">{right}</div>
    </div>
  );
}