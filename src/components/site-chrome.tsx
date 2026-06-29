import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Записаться", href: "/#booking", kind: "primary" },
  { label: "Расписание", href: "/#schedule" },
  { label: "Правила", href: "/#rules" },
  { label: "Документы", href: "/documents" },
  { label: "История", href: "/history" },
  { label: "Уход", href: "/maintenance" },
  { label: "Сообщество", href: "/#community" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-foreground/[0.06] bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            T
          </span>
          <span className="text-base font-bold">Теннис на Пролетарской</span>
        </Link>

        <nav className="order-2 flex w-full min-w-0 items-center gap-1 overflow-x-auto lg:order-none lg:w-auto lg:flex-1 lg:justify-end">
          {navItems.map((item) =>
            item.kind === "primary" ? (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "h-9 px-3 text-sm",
                )}
              >
                {item.label}
                <ArrowRight data-icon="inline-end" />
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-foreground/75 hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <p>Теннис на Пролетарской · общественная информация и расписание.</p>
        <p>
          Адресные формулировки и документы перед публикацией нужно проверить
          по исходным материалам.
        </p>
      </div>
    </footer>
  );
}
