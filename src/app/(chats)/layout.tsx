import SidePanel from "@/components/sidePanel";
import Header from "@/components/header";

export default function ChatsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 min-h-0 flex">
        <SidePanel />
        {children}
      </div>
    </main>
  );
}
