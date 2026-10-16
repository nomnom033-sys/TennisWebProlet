import Image from "next/image";
import { ArrowRight, ExternalLink, MapPin, ShieldCheck } from "lucide-react";

import { BookingForm } from "@/components/booking-form";
import { ScheduleBoard } from "@/components/schedule-board";
import {
  SectionScrollHandler,
  SectionScrollLink,
} from "@/components/section-scroll-link";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getPublicSiteData } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getPublicSiteData();
  const currentCount = data.bookings.filter(
    (booking) => booking.computedStatus === "current",
  ).length;
  const plannedCount = data.bookings.filter(
    (booking) => booking.computedStatus === "planned",
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <SectionScrollHandler />
      <SiteHeader />

      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-10">
          <div className="flex min-w-0 flex-col justify-center gap-6 rounded-[32px] border border-foreground/[0.06] bg-card p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="grid gap-4">
              <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-[0.98] sm:text-6xl lg:text-7xl">
                Теннис на Пролетарской
              </h1>
              <p className="max-w-2xl text-xl leading-9 text-muted-foreground">
                Публичный сайт городских кортов и локального теннисного
                сообщества: расписание, электронная очередь, правила записи и
                связь с участниками.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                render={<SectionScrollLink sectionId="booking" />}
                nativeButton={false}
                size="lg"
              >
                Создать запись
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button render={<a href="/rules" />} nativeButton={false} variant="outline" size="lg">
                Правила записи
              </Button>
            </div>
            <div className="grid gap-3 rounded-2xl border border-foreground/[0.08] bg-muted/35 p-4 text-sm sm:grid-cols-3">
              <Metric label="Сейчас" value={String(currentCount)} />
              <Metric label="Запланировано" value={String(plannedCount)} />
              <Metric label="Доступных корта" value={String(data.courts.length)} />
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

          <div className="grid min-w-0 gap-4">
            <div className="overflow-hidden rounded-[32px] border border-foreground/[0.08] bg-card shadow-sm">
              <Image
                src="/hero-courts.png"
                alt="Муниципальные теннисные корты у жилого района"
                width={1536}
                height={864}
                priority
                className="aspect-[5/4] w-full object-cover object-center lg:aspect-[4/3]"
              />
            </div>
            <div className="rounded-[28px] border border-foreground/[0.08] bg-card p-5 shadow-sm">
              <div className="grid gap-4">
                {data.courts.map((court) => (
                  <div key={court.id} className="flex items-start gap-3">
                    <MapPin data-icon="inline-start" />
                    <div className="grid gap-1">
                      <p className="font-medium">{court.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {court.address}
                      </p>
                      {court.mapUrl && (
                        <a
                          href={court.mapUrl}
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
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
          <ScheduleBoard bookings={data.bookings} />
          <BookingForm courts={data.courts} />
        </section>
      </main>
      <SiteFooter />
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
