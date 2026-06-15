"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { insforge } from "@/lib/insforge-client";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/find-jobs", label: "Find Jobs" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async (): Promise<void> => {
      const { data } = await insforge.auth.getCurrentUser();

      if (isMounted) {
        setIsAuthenticated(Boolean(data.user));
      }
    };

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async (): Promise<void> => {
    await insforge.auth.signOut();
    setIsAuthenticated(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="w-full border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-360 items-center justify-between px-6">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={128}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium leading-5 text-text-dark transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="inline-flex items-center justify-center rounded-md bg-overlay px-4 py-2 text-sm font-medium leading-5 text-surface transition-colors hover:bg-overlay-dark"
          >
            Sign out
          </button>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-overlay px-4 py-2 text-sm font-medium leading-5 text-surface transition-colors hover:bg-overlay-dark"
          >
            Start for free
          </Link>
        )}
      </div>
    </header>
  );
}
