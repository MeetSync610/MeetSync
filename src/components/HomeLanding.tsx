import Hero from "./Hero";
import Nav from "./Nav";
import SupportButton from "./SupportButton";
import Steps from "./Steps";
import Features from "./Features";
import Faq from "./Faq";
import useIsMobile from "../hooks/useIsMobile";

export default function HomeLanding() {
  const isMobile = useIsMobile(); // <=960px

  return (
    <>
      {/* En mobile, la Nav va ARRIBA del Hero para evitar bugs*/}
      {isMobile && <Nav />}

      <Hero />

      {/* En desktop/tablet, la Nav va DEBAJO del Hero (para hacer el efecto piola d q desp se qda pegada) */}
      {!isMobile && <Nav />}

      <SupportButton />
      <Steps />
      <Features />
      <Faq />
    </>
  );
}