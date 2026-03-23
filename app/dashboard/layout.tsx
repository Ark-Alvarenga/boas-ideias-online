import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarNav, MobileNav } from "@/components/dashboard/sidebar-nav";
import { getDatabase } from "@/lib/mongodb";
import type { User } from "@/lib/types";
import { authConfig, verifySessionToken } from "@/lib/auth";

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.cookieName)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  const db = await getDatabase();
  const users = db.collection<User>("users");
  const user = await users.findOne({
    _id: new (await import("mongodb")).ObjectId(payload.userId),
  });
  return user ?? null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  const initials = (user.name?.charAt(0) ?? "?").toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar for desktop */}
      <div className="hidden lg:block">
        <SidebarNav userInitials={initials} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Mobile header with hamburger menu */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b-2 border-foreground bg-background px-4 lg:hidden">
          <MobileNav userInitials={initials} />
          <span className="font-serif text-lg font-black">Boas Ideias</span>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <main className="">{children}</main>
      </div>
    </div>
  );
}
