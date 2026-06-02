import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface PageWrapperProps {
  title: string;
  children: React.ReactNode;
}

export function PageWrapper({ title, children }: PageWrapperProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar title={title} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
