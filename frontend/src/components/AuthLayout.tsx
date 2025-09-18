import { Outlet } from "react-router-dom";
import "../styles/AuthLayout.css";

export default function AuthLayout() {
  return (
    <div className="AuthLayout">
      <main className="AuthMain">
        <Outlet />
      </main>
    </div>
  );
}