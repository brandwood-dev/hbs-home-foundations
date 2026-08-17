import { announcements } from "@/fixtures/navigation.fixture";

export function AnnouncementBar() {
  const doubled = [...announcements, ...announcements];

  return (
    <div className="border-b border-border bg-accent text-accent-foreground">
      {/* Mobile: un seul message à la fois */}
      <div className="overflow-hidden sm:hidden">
        <div className="marquee-track flex w-max items-center gap-12 py-2 text-xs">
          {doubled.map((item, index) => (
            <span key={`${item.id}-${index}`} className="whitespace-nowrap px-2">
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <ul className="mx-auto hidden max-w-7xl items-center justify-center gap-10 px-4 py-2 text-xs sm:flex">
        {announcements.map((item) => (
          <li key={item.id} className="whitespace-nowrap tracking-wide">
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
