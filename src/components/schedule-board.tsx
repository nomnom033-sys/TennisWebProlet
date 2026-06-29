import { CalendarDays, Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDisplayTime } from "@/features/bookings/format";
import type { PublicBooking } from "@/lib/public-data";
import { courtName, statusLabel } from "@/lib/site-data";

type ScheduleGroup = "current" | "planned" | "played";

export function ScheduleBoard({ bookings }: { bookings: PublicBooking[] }) {
  const groups: Record<ScheduleGroup, PublicBooking[]> = {
    current: bookings.filter((booking) => booking.computedStatus === "current"),
    planned: bookings.filter((booking) => booking.computedStatus === "planned"),
    played: bookings.filter((booking) => booking.computedStatus === "played"),
  };

  return (
    <Card id="schedule" className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Расписание</CardTitle>
            <CardDescription>
              Кто играет сейчас, что запланировано и что уже сыграно.
            </CardDescription>
          </div>
          <Badge variant="secondary">{bookings.length} записей</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="planned" className="gap-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="current">Сейчас</TabsTrigger>
            <TabsTrigger value="planned">Запланировано</TabsTrigger>
            <TabsTrigger value="played">Сыграно</TabsTrigger>
          </TabsList>
          {(["current", "planned", "played"] as const).map((group) => (
            <TabsContent key={group} value={group}>
              <BookingList bookings={groups[group]} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function BookingList({ bookings }: { bookings: PublicBooking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        В этой вкладке пока нет записей.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {bookings.map((booking) => (
        <article
          key={booking.id}
          className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_auto]"
        >
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{statusLabel(booking.computedStatus)}</Badge>
              <span className="font-medium">{booking.playerName}</span>
              {booking.telegramUsername && (
                <span className="text-sm text-muted-foreground">
                  @{booking.telegramUsername}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin data-icon="inline-start" />
                {courtName(booking.courtId)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock data-icon="inline-start" />
                {formatDisplayTime(booking.startAt, booking.endAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays data-icon="inline-start" />
                {new Intl.DateTimeFormat("ru-RU", {
                  day: "2-digit",
                  month: "long",
                  weekday: "long",
                }).format(new Date(booking.startAt))}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
