import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import MaterialsTable from "@/components/MaterialsTable";
import QualityAssurance from "@/components/QualityAssurance";
import Gallery from "@/components/Gallery";
import QuoteForm from "@/components/QuoteForm";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <Hero />
      <Services />
      <MaterialsTable />
      <QualityAssurance />
      <Gallery />
      <QuoteForm />
      <Footer />
    </main>
  );
}
