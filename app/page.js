import TopBar from "@/components/TopBar";
import Hero from "@/components/Hero";
import Flagship from "@/components/Flagship";
import Receipts from "@/components/Receipts";
import WorkList from "@/components/WorkList";
import WorkWithMe from "@/components/WorkWithMe";
import Now from "@/components/Now";
import SpecPlate from "@/components/SpecPlate";
import WorkedWith from "@/components/WorkedWith";
import DocsList from "@/components/DocsList";
import WritingList from "@/components/WritingList";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="wrap">
      <TopBar />
      <main>
        <Hero />
        <Flagship />
        <Receipts />
        <WorkList />
        <WorkWithMe />
        <Now />
        <SpecPlate />
        <WorkedWith />
        <WritingList />
        <DocsList />
      </main>
      <SiteFooter />
    </div>
  );
}
