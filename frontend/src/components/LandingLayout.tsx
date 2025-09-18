import { Outlet } from "react-router-dom";
import Footer from "./Footer";

export default function LandingLayout() {
  return (
    <div className="App">
      {/*aca sin nav por lo del mobile*/}
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
