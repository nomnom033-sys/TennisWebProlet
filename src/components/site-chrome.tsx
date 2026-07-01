import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionScrollLink } from "@/components/section-scroll-link";
import { buttonVariants } from "@/components/ui/button";
import { courts } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Записаться", href: "/", sectionId: "booking", kind: "primary" },
  { label: "Расписание", href: "/", sectionId: "schedule" },
  { label: "Правила", href: "/rules" },
  { label: "Документы", href: "/documents" },
  { label: "История", href: "/history" },
  { label: "Уход за кортом", href: "/maintenance" },
] as const;

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
            "kind" in item && item.kind === "primary" ? (
              <SectionScrollLink
                key={item.label}
                sectionId={item.sectionId}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "h-9 px-3 text-sm",
                )}
              >
                {item.label}
                <ArrowRight data-icon="inline-end" />
              </SectionScrollLink>
            ) : "sectionId" in item ? (
              <SectionScrollLink
                key={item.label}
                sectionId={item.sectionId}
                className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-foreground/75 hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </SectionScrollLink>
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
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:grid-cols-[1.1fr_0.82fr_0.88fr] lg:px-8">
        <div className="grid gap-2">
          <p className="font-medium text-foreground">Теннис на Пролетарской</p>
          <p>
            Публичный сайт городских кортов и локального теннисного сообщества:
            расписание, электронная очередь, правила записи и связь с
            участниками.
          </p>
          <p>
            Поддержка сайта:{" "}
            <a
              href="mailto:tennis-prolet@ya.ru"
              className="font-medium text-foreground underline underline-offset-4"
            >
              tennis-prolet@ya.ru
            </a>
          </p>
        </div>
        <address className="grid gap-2 not-italic">
          <p className="font-medium text-foreground">Адреса кортов</p>
          {courts.map((court) => (
            <p key={court.id}>
              <span className="font-medium text-foreground">{court.name}</span>
              <br />
              {court.address}
            </p>
          ))}
        </address>
        <div className="grid content-start gap-2">
          <p className="font-medium text-foreground">
            Обработка персональных данных
          </p>
          <p>
            Персональные данные игроков не сохраняются и не передаются третьим
            лицам. Указывая личные данные вы подтверждаете согласие с обработкой
            персональных данных.
          </p>
        </div>
      </div>
    </footer>
  );
}
