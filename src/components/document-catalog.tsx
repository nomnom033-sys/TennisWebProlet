import { FileText, LockKeyhole, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ProjectDocument } from "@/lib/site-data";

const categoryLabels: Record<ProjectDocument["category"], string> = {
  appeal: "Обращение",
  response: "Ответ",
  estimate: "Смета",
  scheme: "Схема",
  act: "Акт",
  photo: "Фото",
  other: "Другое",
};

export function DocumentCatalog({ documents }: { documents: ProjectDocument[] }) {
  return (
    <Card id="documents" className="shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-secondary">
            <FileText data-icon="inline-start" />
          </span>
          <div>
            <CardTitle>Документы проекта</CardTitle>
            <CardDescription>
              Каталог материалов строительства, ремонта и коммуникации с
              администрацией. Файлы открываются после проверки и редактуры.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {documents.map((document) => (
            <article
              key={document.id}
              className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto]"
            >
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{categoryLabels[document.category]}</Badge>
                  {document.needsRedaction && (
                    <Badge variant="secondary">
                      <LockKeyhole data-icon="inline-start" />
                      нужна редактура
                    </Badge>
                  )}
                </div>
                <h3 className="font-medium">{document.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {document.description}
                </p>
              </div>
              <Dialog>
                <DialogTrigger render={<Button variant="outline" />}>
                  <Search data-icon="inline-start" />
                  Открыть
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{document.title}</DialogTitle>
                    <DialogDescription>
                      {document.needsRedaction
                        ? "Файл пока не опубликован: сначала нужно скрыть персональные данные."
                        : "Предпросмотр документа проекта."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">
                    {document.fileUrl && !document.needsRedaction ? (
                      <a href={document.fileUrl} target="_blank" rel="noreferrer">
                        Открыть исходный файл
                      </a>
                    ) : (
                      "Для v1 добавлен каталог. Сам файл подключается после ревью и редактуры."
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
