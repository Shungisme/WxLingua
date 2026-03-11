import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HomeClient } from "./home-client";

export function HomePage() {
  return (
    <>
      <Navbar />
      <HomeClient />
      <Footer />
    </>
  );
}
