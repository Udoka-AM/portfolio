import TopBar from "@/components/TopBar";
import Hero from "@/components/Hero";
import TrialBalance from "@/components/TrialBalance";
import WorkList from "@/components/WorkList";
import DocsList from "@/components/DocsList";
import WritingList from "@/components/WritingList";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="wrap">
      <TopBar />
      <main>
        <Hero />
        <TrialBalance />
        <WorkList />
        <DocsList />
        <WritingList />
      </main>
      <SiteFooter />
    </div>
  );
}
