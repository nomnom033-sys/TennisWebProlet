import { RulesSection } from "@/components/info-sections";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-[32px] border border-foreground/[0.06] bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Правила записи
          </h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">
            Общие публичные правила пользования кортами.
          </p>
        </section>
        <RulesSection />
      </main>
      <SiteFooter />
    </div>
  );
}
