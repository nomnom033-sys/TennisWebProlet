import { DocumentCatalog } from "@/components/document-catalog";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getPublicSiteData } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const data = await getPublicSiteData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageIntro
          title="Документы проекта"
          description="Каталог материалов строительства, ремонта и коммуникации с администрацией. Файлы открываются после проверки и редактуры."
        />
        <DocumentCatalog documents={data.documents} />
      </main>
      <SiteFooter />
    </div>
  );
}

function PageIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-[32px] border border-foreground/[0.06] bg-card p-6 shadow-sm sm:p-8">
      <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">
        {description}
      </p>
    </section>
  );
}
