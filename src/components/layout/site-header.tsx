"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

const navItems = [
  { label: "Docs", href: "/docs" },
  { label: "Company", href: "/roadmap" },
  { label: "Blog", href: "/blog" },
  { label: "Community", href: "/community" },
];

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-white/5 bg-background/80 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <Container className="flex items-center justify-between gap-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Hyro Protocol home"
        >
          <div className="relative h-10 w-10">
            <Image
              src="/images/logo.png"
              alt="Hyro Protocol logo mark"
              fill
              sizes="40px"
              className="object-contain drop-shadow-[0_15px_35px_rgba(8,47,73,0.4)]"
              priority
            />
          </div>
          <span className="text-md font-semibold uppercase tracking-[0.24em] text-foreground">
            Hyro Protocol
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button asChild size="sm" className="shadow-glow-primary">
          <Link href="#vaults">
            Explore vaults
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </Container>
    </header>
  );
}
