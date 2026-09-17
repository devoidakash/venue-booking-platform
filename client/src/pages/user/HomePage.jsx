"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Search,
  User,
  Menu,
  Globe2,
  Camera,
  Play,
  MessageCircle,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getMe, logout } from "@/api/user.api";
import Logo from "@/assets/logo.svg";

const CITIES = [
  { city: "Raipur", state: "Chhattisgarh" },
  { city: "Gurugram", state: "Haryana" },
  { city: "Bhopal", state: "Madhya Pradesh" },
  { city: "Indore", state: "Madhya Pradesh" },
  { city: "Bengaluru", state: "Karnataka" },
];

const FOOTER_LINKS = [
  { label: "Terms & Conditions" },
  { label: "Privacy Policy" },
  { label: "Contact us" },
  { label: "List your venue", href: "/partner-with-us" },
];

function UserAvatar({ email }) {
  const initial = email?.trim().charAt(0).toUpperCase();

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
      {initial}
    </span>
  );
}

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.9 2h3.3l-7.2 8.3L23.5 22h-6.6l-5.2-6.8L5.8 22H2.5l7.7-8.8L1.5 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20Z" />
    </svg>
  );
}

/* --------------------------------- header --------------------------------- */

function SiteHeader({ location, onLocationChange }) {
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      window.location.href = "/";
    }
  };

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then((data) => {
        if (isMounted) setUser(data);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="flex h-16 w-full items-center gap-4 px-4 sm:px-6 lg:px-8">
          <a href="/" aria-label="Venuz home" className="shrink-0">
            <span className="inline-flex items-center gap-2">
              <img src={Logo} alt="Venuz" className="h-9 w-9" />
              <span className="text-xl font-bold tracking-tight text-slate-800">
                Venuez
              </span>
            </span>
          </a>

          <Separator orientation="vertical" className="hidden h-8 sm:block" />

          {/* City picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group hidden items-center gap-2 rounded-md px-1 py-1 text-left sm:flex">
                <MapPin className="h-5 w-5 text-violet-600" />
                <span className="leading-tight">
                  <span className="flex items-center gap-1 text-[15px] font-semibold">
                    {location.city}
                    <ChevronDown className="h-3.5 w-3.5 opacity-50 transition group-data-[state=open]:rotate-180" />
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {location.state}
                  </span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="font-normal text-muted-foreground">
                Choose your city
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CITIES.map((c) => (
                <DropdownMenuItem
                  key={c.city}
                  onClick={() => onLocationChange(c)}
                  className="flex-col items-start gap-0"
                >
                  <span className="text-sm font-medium">{c.city}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.state}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5 text-violet-600" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Account"
                  className="rounded-full bg-muted p-0"
                >
                  {user ? (
                    <UserAvatar email={user.email} />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <DropdownMenuItem>My bookings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Help</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>Sign in</DropdownMenuItem>
                    <DropdownMenuItem>My bookings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Help</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile city / nav */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <p className="mb-3 mt-6 text-sm font-medium">
                  Choose your city
                </p>
                <div className="space-y-1">
                  {CITIES.map((c) => (
                    <button
                      key={c.city}
                      onClick={() => onLocationChange(c)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${
                        c.city === location.city ? "bg-muted font-medium" : ""
                      }`}
                    >
                      {c.city}
                      <span className="block text-xs text-muted-foreground">
                        {c.state}
                      </span>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}

/* --------------------------------- footer --------------------------------- */

function SiteFooter() {
  return (
    <footer className="w-full bg-neutral-900 text-neutral-100">
      <div className="w-full px-6 py-20 sm:px-8 lg:px-12">
        <div className="grid gap-8 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <a
            href="/"
            aria-label="Venuz home"
            className="flex items-center justify-center gap-3 md:justify-self-start"
          >
            <img src={Logo} alt="Venuz" className="h-10 w-10" />
            <span className="text-2xl font-bold tracking-tight">Venuez</span>
          </a>

          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium">
            {FOOTER_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-neutral-200 transition hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center justify-center gap-5 md:justify-self-end">
            {[
              { Icon: MessageCircle, label: "WhatsApp", href: "#" },
              { Icon: Globe2, label: "Facebook", href: "#" },
              { Icon: Camera, label: "Instagram", href: "#" },
              { Icon: XIcon, label: "X", href: "#" },
              { Icon: Play, label: "YouTube", href: "#" },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-neutral-300 transition hover:text-white"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <Separator className="my-8 bg-neutral-700" />

        <p className="text-center text-xs leading-relaxed text-neutral-400">
          By using this site you agree to our Terms of Service, Cookie Policy,
          Privacy Policy and Content Guidelines. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ---------------------------------- shell --------------------------------- */

export default function HomePage({ children }) {
  const [location, setLocation] = useState(CITIES[0]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f5ff]">
      <SiteHeader location={location} onLocationChange={setLocation} />

      <main className="flex-1">{children}</main>

      <SiteFooter />
    </div>
  );
}

export { SiteHeader, SiteFooter };
