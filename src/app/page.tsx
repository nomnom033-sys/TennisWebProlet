import Image from "next/image";
import { ArrowRight, ExternalLink, MapPin, ShieldCheck } from "lucide-react";

import { BookingForm } from "@/components/booking-form";
import { DocumentCatalog } from "@/components/document-catalog";
import {
  CommunitySection,
  HistorySection,
  RulesSection,
} from "@/components/info-sections";
import { ScheduleBoard } from "@/components/schedule-board";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicSiteData } from "@/lib/public-data";

const navItems = [
  ["Расписание", "#schedule"],
  ["Записаться", "#booking"],
  ["Правила", "#rules"],
  ["Документы", "#documents"],
  ["История", "#history"],
  ["Сообщество", "#community"],
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getPublicSiteData();
  const primaryCourt = data.courts.find((court) => court.isPrimary) ?? data.courts[0];
  const currentCount = data.bookings.filter(
    (booking) => booking.computedStatus === "current",
  ).length;
  const plannedCount = data.bookings.filter(
    (booking) => booking.computedStatus === "planned",
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-foreground/[0.06] bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              T
            </span>
            <span className="text-base font-bold">Теннис на Пролетарской</span>
          </a>
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/75 hover:bg-muted hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
          <Button render={<a href="#booking" />} nativeButton={false}>
            Записаться
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center gap-7 rounded-[32px] border border-foreground/[0.06] bg-card p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Муниципальные корты</Badge>
              <Badge variant="outline">
                {data.source === "supabase" ? "Live Supabase" : "Demo seed"}
              </Badge>
            </div>
            <div className="grid gap-4">
              <h1 className="max-w-3xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">
                Теннис на Пролетарской
              </h1>
              <p className="max-w-2xl text-xl leading-9 text-muted-foreground">
                Публичный сайт городских кортов и локального теннисного
                сообщества: расписание, электронная очередь, правила, документы
                проекта и история взаимодействия с администрацией.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button render={<a href="#booking" />} nativeButton={false} size="lg">
                Создать запись
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button render={<a href="#rules" />} nativeButton={false} variant="outline" size="lg">
                Правила записи
              </Button>
            </div>
            <div className="grid gap-3 rounded-2xl border border-foreground/[0.08] bg-muted/35 p-4 text-sm sm:grid-cols-3">
              <Metric label="Сейчас" value={String(currentCount)} />
              <Metric label="Запланировано" value={String(plannedCount)} />
              <Metric label="Кортов в расписании" value={String(data.courts.length)} />
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-secondary/70 p-4 text-sm text-muted-foreground">
              <ShieldCheck data-icon="inline-start" />
              <p>
                Запись на сайте — это электронная форма живой очереди. Она
                помогает участникам планировать игру, но не даёт специальных
                прав на муниципальный корт.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="overflow-hidden rounded-[32px] border border-foreground/[0.08] bg-card shadow-sm">
              <Image
                src="/hero-courts.png"
                alt="Муниципальные теннисные корты у жилого района"
                width={1536}
                height={864}
                priority
                className="aspect-[5/4] w-full object-cover object-center lg:aspect-[4/5]"
              />
            </div>
            <div className="rounded-[28px] border border-foreground/[0.08] bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <MapPin data-icon="inline-start" />
                <div className="grid gap-1">
                  <p className="font-medium">{primaryCourt?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {primaryCourt?.address}
                  </p>
                  {primaryCourt?.mapUrl && (
                    <a
                      href={primaryCourt.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-fit items-center gap-1 text-sm font-medium"
                    >
                      Открыть на Яндекс.Картах
                      <ExternalLink data-icon="inline-end" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <ScheduleBoard bookings={data.bookings} />
          <BookingForm courts={data.courts} />
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:px-8">
          <RulesSection />
          <HistorySection maintenance={data.maintenanceItems} />
          <DocumentCatalog documents={data.documents} />
          <CommunitySection />
        </section>
      </main>
      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>Теннис на Пролетарской · общественная информация и расписание.</p>
          <p>
            Адресные формулировки и документы перед публикацией нужно проверить
            по исходным материалам.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
