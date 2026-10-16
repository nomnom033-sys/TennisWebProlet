import type { BookingStatus, CourtId, ExistingBooking } from "@/features/bookings/domain";

export type Court = {
  id: CourtId;
  name: string;
  address: string;
  mapUrl: string;
  isPrimary: boolean;
};

export type ProjectDocument = {
  id: string;
  title: string;
  date?: string;
  category: "appeal" | "response" | "estimate" | "scheme" | "act" | "photo" | "other";
  courtId?: CourtId | "both";
  description: string;
  fileUrl?: string;
  previewUrl?: string;
  isPublic: boolean;
  needsRedaction: boolean;
};

export type MaintenanceItem = {
  id: string;
  courtId: CourtId;
  date: string;
  title: string;
  status: "done" | "in_progress" | "rejected" | "planned";
  summary: string;
  sourceUrl?: string;
};

export const courts: Court[] = [
  {
    id: "proletarsky",
    name: "Пролетарский",
    address:
      "Санкт-Петербург, у ст. м. Пролетарская, пр. Обуховской Обороны / ул. Грибакиных",
    mapUrl: "https://yandex.ru/maps/org/tennisny_kort/191177417429",
    isPrimary: true,
  },
  {
    id: "obukhovo",
    name: "Обуховский",
    address: "2-й Рабфаковский переулок, 1к1",
    mapUrl: "https://yandex.ru/maps/-/CTa5YQm-",
    isPrimary: false,
  },
];

export const seedBookings: ExistingBooking[] = [
  {
    id: "seed-current",
    courtId: "proletarsky",
    startAt: "2026-06-28T20:00:00+03:00",
    endAt: "2026-06-28T21:30:00+03:00",
    status: "planned",
    playerName: "Даниил",
    telegramUsername: "danil_tennis",
  },
  {
    id: "seed-planned",
    courtId: "obukhovo",
    startAt: "2026-06-29T10:00:00+03:00",
    endAt: "2026-06-29T12:00:00+03:00",
    status: "planned",
    playerName: "Мария",
  },
  {
    id: "seed-played",
    courtId: "proletarsky",
    startAt: "2026-06-27T16:00:00+03:00",
    endAt: "2026-06-27T18:00:00+03:00",
    status: "planned",
    playerName: "Sergey M",
    telegramUsername: "sergey_m",
  },
];

export const documents: ProjectDocument[] = [
  {
    id: "doc-appeals",
    title: "Пакет обращений жителей по ремонту корта",
    date: "2023-10-24",
    category: "appeal",
    courtId: "proletarsky",
    description:
      "Каталог документов для публикации после проверки персональных данных.",
    isPublic: false,
    needsRedaction: true,
  },
  {
    id: "doc-response",
    title: "Ответы и коммуникация с МО Обуховский",
    date: "2023-11-01",
    category: "response",
    courtId: "proletarsky",
    description:
      "Материалы о встрече с администрацией и дальнейшей обратной связи.",
    isPublic: false,
    needsRedaction: true,
  },
  {
    id: "doc-maintenance",
    title: "Лента обслуживания: было / стало",
    date: "2026-03-20",
    category: "photo",
    courtId: "both",
    description:
      "Фотографии и статусы заявок по уборке, покосу и состоянию площадок.",
    isPublic: false,
    needsRedaction: true,
  },
];

export const maintenanceItems: MaintenanceItem[] = [
  {
    id: "m-2025-08-21",
    courtId: "proletarsky",
    date: "2025-08-21",
    title: "Покос травы на корте Пролетарский",
    status: "done",
    summary: "Работы завершены, состояние корта подтверждалось участниками.",
  },
  {
    id: "m-2025-09-04",
    courtId: "proletarsky",
    date: "2025-09-04",
    title: "Запрос на починку калитки",
    status: "rejected",
    summary: "Заявка получила отказ, нужна повторная проверка актуальности.",
  },
  {
    id: "m-2026-03-20",
    courtId: "proletarsky",
    date: "2026-03-20",
    title: "Уборка к открытию сезона 2026",
    status: "done",
    summary:
      "Муниципалитет отреагировал на заявку через городские сервисы и сделал уборку.",
  },
];

export function courtName(courtId: CourtId) {
  return courts.find((court) => court.id === courtId)?.name ?? courtId;
}

export function statusLabel(status: BookingStatus) {
  return {
    planned: "Запланировано",
    current: "Сейчас играют",
    played: "Сыграно",
    cancelled: "Отменено",
  }[status];
}
