import Chat from "@/components/chat";
import Header from "@/components/header";
import SidePanel from "@/components/sidePanel";

export default function Home() {
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 min-h-0 flex">
        <SidePanel />
        <Chat />
      </div>
    </main>
  );
}
