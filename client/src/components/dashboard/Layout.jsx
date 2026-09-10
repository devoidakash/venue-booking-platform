import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({
  sidebarLinks = [],
  user,
  searchPlaceholder,
  onSearch,
  onLogout,
  children,
}) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-50/40 text-slate-900">
      <Sidebar links={sidebarLinks} onLogout={onLogout} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          user={user}
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
        />
        <main className="flex-1 overflow-auto p-6 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
