import { ArrowLeft, ArrowUpRight, Compass, House, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo.svg";

export default function NotFoundError() {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#f8f8f5] text-slate-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(30,41,59,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.035)_1px,transparent_1px)] bg-size-[44px_44px] mask-[linear-gradient(to_bottom,black,transparent_88%)]"
      />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link
          to="/"
          aria-label="Venuz home"
          className="inline-flex items-center gap-2.5"
        >
          <img src={Logo} alt="" className="h-9 w-9" />
          <span className="text-lg font-bold tracking-tight">Venuez</span>
        </Link>
        <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 sm:block">
          Find your next place
        </span>
      </header>

      <section className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-5 pb-16 pt-8 sm:px-8 md:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-12 lg:pb-24">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 border-l-2 border-violet-600 pl-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
            <Compass className="h-4 w-4 text-violet-600" />
            404 / off the map
          </p>
          <h1 className="text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
            Looks like
            <br />
            <span className="font-normal text-slate-500">you took a turn.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
            We can’t find the page you’re looking for. The link may have moved,
            or the address might be a little off.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-violet-700 hover:bg-violet-800"
            >
              <Link to="/">
                <House aria-hidden="true" />
                Back to venues
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="gap-2 border-slate-300 bg-white/70"
              onClick={goBack}
            >
              <ArrowLeft aria-hidden="true" />
              Go back
            </Button>
          </div>

          <Link
            to="/partner-with-us"
            className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-violet-700 hover:decoration-violet-500"
          >
            Looking to list a venue?
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div
          aria-label="A map marker pointing to a missing destination"
          role="img"
          className="relative mx-auto flex aspect-square w-full max-w-124 items-center justify-center"
        >
          <div className="absolute inset-[8%] rotate-[-8deg] border border-slate-300/80" />
          <div className="absolute inset-[15%] rotate-[7deg] border border-dashed border-violet-300" />
          <div className="absolute left-[14%] top-[25%] h-2 w-2 rounded-full bg-amber-500" />
          <div className="absolute bottom-[20%] right-[18%] h-2.5 w-2.5 rounded-full bg-violet-600" />
          <div className="absolute left-[22%] top-[20%] h-[60%] w-[56%] rotate-25 border-b-2 border-dashed border-slate-400/70" />

          <div className="relative flex h-[58%] w-[58%] items-center justify-center rounded-full bg-[#eeeaf8]">
            <div className="absolute inset-[11%] rounded-full border border-violet-200" />
            <div className="absolute inset-[24%] rounded-full border border-violet-300/80" />
            <MapPin
              aria-hidden="true"
              className="relative h-20 w-20 stroke-[1.25] text-violet-700 sm:h-24 sm:w-24"
            />
            <span className="absolute bottom-[17%] right-[14%] grid h-8 w-8 place-items-center rounded-full bg-amber-400 text-xs font-bold text-slate-950">
              ?
            </span>
          </div>

          <span className="absolute bottom-[4%] left-[8%] font-mono text-[clamp(5rem,18vw,10rem)] font-bold leading-none tracking-[-0.08em] text-slate-200">
            404
          </span>
          <span className="absolute right-[3%] top-[9%] rotate-3 bg-slate-950 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-lg">
            Destination unknown
          </span>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-7xl items-center justify-between border-t border-slate-200/80 px-5 py-4 text-xs text-slate-500 sm:px-8 lg:px-12">
        <span>Venuez · Places worth going</span>
        <Link
          to="/"
          className="font-medium text-slate-600 hover:text-violet-700"
        >
          Explore venues
        </Link>
      </footer>
    </main>
  );
}
