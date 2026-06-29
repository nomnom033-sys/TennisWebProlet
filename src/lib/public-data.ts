import { classifyBookingStatus, type CourtId, type ExistingBooking } from "@/features/bookings/domain";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  courts,
  documents,
  maintenanceItems,
  seedBookings,
  type Court,
  type MaintenanceItem,
  type ProjectDocument,
} from "@/lib/site-data";

export type PublicBooking = ExistingBooking & {
  computedStatus: "planned" | "current" | "played" | "cancelled";
};

export type PublicSiteData = {
  courts: Court[];
  bookings: PublicBooking[];
  documents: ProjectDocument[];
  maintenanceItems: MaintenanceItem[];
  source: "supabase" | "seed";
};

export async function getPublicSiteData(): Promise<PublicSiteData> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      courts,
      bookings: classifyBookings(seedBookings),
      documents,
      maintenanceItems,
      source: "seed",
    };
  }

  const [courtsResult, bookingsResult, documentsResult, maintenanceResult] =
    await Promise.all([
      supabase
        .from("courts")
        .select("slug,name,address,map_url,is_primary")
        .order("is_primary", { ascending: false }),
      supabase
        .from("bookings")
        .select("id,court:courts(slug),start_at,end_at,status,player_name,telegram_username,phone,phone_public")
        .neq("status", "cancelled")
        .order("start_at", { ascending: true }),
      supabase
        .from("documents")
        .select("id,title,date,category,court:courts(slug),description,file_path,preview_path,is_public,needs_redaction")
        .eq("is_public", true)
        .order("date", { ascending: false }),
      supabase
        .from("maintenance_items")
        .select("id,court:courts(slug),date,title,status,summary,source_url")
        .order("date", { ascending: false }),
    ]);

  if (courtsResult.error || bookingsResult.error) {
    return {
      courts,
      bookings: classifyBookings(seedBookings),
      documents,
      maintenanceItems,
      source: "seed",
    };
  }

  return {
    courts: (courtsResult.data ?? []).map((court) => ({
      id: court.slug as CourtId,
      name: court.name,
      address: court.address,
      mapUrl: court.map_url ?? "",
      isPrimary: court.is_primary,
    })),
    bookings: classifyBookings(
      (bookingsResult.data ?? []).map((booking) => ({
      id: booking.id,
      courtId: relationSlug(booking.court) as CourtId,
        startAt: booking.start_at,
        endAt: booking.end_at,
        status: booking.status,
        playerName: booking.player_name,
        telegramUsername: booking.telegram_username,
        phone: booking.phone_public ? booking.phone : null,
      })),
    ),
    documents: (documentsResult.data ?? []).map((document) => ({
      id: document.id,
      title: document.title,
      date: document.date ?? undefined,
      category: document.category,
      courtId: (relationSlug(document.court) as CourtId | undefined) ?? undefined,
      description: document.description ?? "",
      fileUrl: document.file_path ?? undefined,
      previewUrl: document.preview_path ?? undefined,
      isPublic: document.is_public,
      needsRedaction: document.needs_redaction,
    })),
    maintenanceItems: (maintenanceResult.data ?? []).map((item) => ({
      id: item.id,
      courtId: relationSlug(item.court) as CourtId,
      date: item.date,
      title: item.title,
      status: item.status,
      summary: item.summary ?? "",
      sourceUrl: item.source_url ?? undefined,
    })),
    source: "supabase",
  };
}

function relationSlug(value: { slug: string } | { slug: string }[] | null) {
  return Array.isArray(value) ? value[0]?.slug : value?.slug;
}

function classifyBookings(bookings: ExistingBooking[]): PublicBooking[] {
  const at = new Date();

  return bookings.map((booking) => ({
    ...booking,
    computedStatus: classifyBookingStatus({
      status: booking.status,
      startAt: booking.startAt,
      endAt: booking.endAt,
      at,
    }),
  }));
}
