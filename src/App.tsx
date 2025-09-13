import { Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
// import Hero from "./components/Hero";
// import Steps from "./components/Steps";
// import Features from "./components/Features";
import Friends from "./components/Friends";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Schedule from "./components/Schedule";
import Sync from "./components/Sync";
// import Faq from "./components/Faq";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
// import Support from "./components/Support";
import LandingLayout from "./components/LandingLayout";
import HomeLanding from "./components/HomeLanding";

const clientId = "486920096908-t2lfjpqr80vsr4qagde2m31uc9lm6r9e.apps.googleusercontent.com";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/" element={<HomeLanding />} />
        </Route>

        <Route element={<Layout />}>
          {/* <Route path="/" element={<><Hero /><Steps /><Features /><Faq /></>} /> esto lo pase al HomeLanding */}
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/sync" element={<Sync />} />
          <Route path="/terminos" element={<Terms />} />
          <Route path="/privacidad" element={<Privacy />} />
          {/* <Route path="/soporte" element={<Support />}/> */}
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} /> 
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </GoogleOAuthProvider>
  );
}
