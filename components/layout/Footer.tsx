import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/find-jobs", label: "Find Jobs" },
  { href: "/profile", label: "Profile" },
  { href: "/login", label: "Start for free" },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface">
      <div className="mx-auto flex max-w-360 items-center justify-between gap-6 px-6 py-8">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={96}
            height={28}
            className="h-7 w-auto"
          />
        </Link>
        <nav className="flex flex-wrap items-center gap-6 text-sm font-medium leading-5 text-text-secondary">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
