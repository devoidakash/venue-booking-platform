// src/pages/VendorLandingPage.jsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Waves,
  Goal,
  Dumbbell,
  Volleyball,
  Gamepad2,
  Flag,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const VENUE_TYPES = [
  {
    icon: Waves,
    name: "Water Parks",
    desc: "Slot-based entry & seasonal pricing",
  },
  {
    icon: Goal,
    name: "Turf Grounds",
    desc: "Hourly slots & advance reservations",
  },
  {
    icon: Dumbbell,
    name: "Trampoline Parks",
    desc: "Age-based tickets & capacity limits",
  },
  {
    icon: Volleyball,
    name: "Rebound Arenas",
    desc: "Multi-court & tournament scheduling",
  },
  {
    icon: Gamepad2,
    name: "Gaming Zones",
    desc: "Session passes & combo packages",
  },
  { icon: Flag, name: "Play Zones", desc: "Kids tickets & parent bundles" },
];

const STEPS = [
  {
    n: "01",
    title: "Create account",
    desc: "Sign up with your phone — no approvals, no paperwork.",
  },
  {
    n: "02",
    title: "List your venue",
    desc: "Add photos, location, hours, and a short description.",
  },
  {
    n: "03",
    title: "Set slots & pricing",
    desc: "Create ticket types, time slots and availability caps.",
  },
  {
    n: "04",
    title: "Start earning",
    desc: "Customers book online. Payments settle to your bank.",
  },
];

const STATS = [
  ["0%", "Commission first 3 months"],
  ["5 min", "Average time to go live"],
  ["24/7", "Bookings while you sleep"],
  ["₹0", "Setup cost, ever"],
];

export default function VendorLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <div className="w-full max-w-6xl border-x min-h-screen flex flex-col">
        {/* Nav */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              alt="Venuz Logo"
              className="h-7 w-auto object-contain"
            />
            <span className="text-xl font-bold tracking-tight">Venuz</span>
          </div>
          <Link to="/vendor/apply">
            <Button variant="ghost" size="sm" className="font-medium">
              Partner Login
            </Button>
          </Link>
        </header>

        {/* Hero */}
        <section className="relative px-6 pt-24 pb-20 max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <Badge
            variant="secondary"
            className="mb-6 px-3 py-1 text-xs gap-1.5 border-orange-200/60 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
          >
            <Sparkles className="w-3.5 h-3.5" /> For Venue Owners
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15]">
            Your venue. <span className="text-orange-500">Online</span> in
            minutes.
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
            No website, no tech team, no problem. List your water park, turf,
            gaming zone or play area and start selling tickets today.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/vendor/apply">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm transition-all hover:-translate-y-px"
              >
                Join as a Partner <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y bg-muted/20">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x border-muted max-w-5xl mx-auto">
            {STATS.map(([value, label]) => (
              <div key={label} className="p-6 text-center">
                <div className="text-3xl font-bold tracking-tight text-foreground">
                  {value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Venue types */}
        <section className="px-6 py-20 max-w-5xl mx-auto w-full">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Built for every kind of fun venue
            </h2>
            <p className="text-sm text-muted-foreground">
              Everything you need to handle crowds, dynamic slots, and payments.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {VENUE_TYPES.map(({ icon: Icon, name, desc }) => (
              <Card
                key={name}
                className="transition-all duration-200 hover:shadow-md hover:border-orange-200/80 group"
              >
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-orange-500/20">
                    <Icon className="text-orange-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-base mb-1">{name}</h3>
                  <p className="text-sm text-muted-foreground leading-snug">
                    {desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-20 bg-muted/20 border-y">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                Go live in 4 simple steps
              </h2>
              <p className="text-sm text-muted-foreground">
                Zero friction onboarding to start taking online bookings today.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
              {STEPS.map(({ n, title, desc }) => (
                <div key={n} className="flex flex-col">
                  <span className="text-4xl font-extrabold text-orange-500/20 mb-3 font-mono">
                    {n}
                  </span>
                  <h3 className="font-semibold text-base mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Ready to fill your venue every day?
          </h2>
          <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto">
            Join hundreds of local venues already growing their ticket sales
            with Venuz.
          </p>
          <Link to="/vendor/apply">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm transition-all hover:-translate-y-px"
            >
              Get Started — It's Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t bg-muted/10">
          <div className="px-6 py-8 text-sm text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-2">
              <img
                src="/logo.svg"
                alt="Venuz Logo"
                className="h-4 w-auto object-contain opacity-70 transition-all"
              />
              <span>© 2026 Venuz · Discover and book local experiences</span>
            </div>
            <div className="flex gap-6 text-xs sm:text-sm">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
