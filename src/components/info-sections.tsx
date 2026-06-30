import { CheckCircle2, MessageCircle, ShieldAlert, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MaintenanceItem } from "@/lib/site-data";
import { courtName } from "@/lib/site-data";

const statusLabels: Record<MaintenanceItem["status"], string> = {
  done: "Завершено",
  in_progress: "В работе",
  rejected: "Отказ",
  planned: "Запланировано",
};

export function RulesSection() {
  return (
    <Card id="rules" className="scroll-mt-28 rounded-[28px] shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-secondary">
            <ShieldAlert data-icon="inline-start" />
          </span>
          <div>
            <CardTitle>
              Правила записи. Общие публичные правила пользования кортами.
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid overflow-hidden rounded-[28px] border border-foreground/10 bg-card lg:grid-cols-4">
          <RuleStep index="01" title="Формат">
            Дата `ДД.ММ`, день недели, время `1500-1630`, корт отдельной
            строкой. Без причин, пояснений и редактирования старых записей.
          </RuleStep>
          <RuleStep index="02" title="Ограничения">
            Не дальше 7 календарных дней включительно. До 18:00 до 2 часов,
            после 18:00 до 1,5 часов. Не больше 2 активных записей на игрока.
          </RuleStep>
          <RuleStep index="03" title="Отмена">
            Воспользуйтесь уникальной ссылкой для удаления записи, если хотите
            отменить бронь.
          </RuleStep>
          <RuleStep index="04" title="Электронная очередь">
            Запись помогает планировать, но не создаёт дополнительных прав на
            муниципальный корт и не заменяет живую вежливую договорённость.
          </RuleStep>
        </div>
      </CardContent>
    </Card>
  );
}

export function HistorySection() {
  return (
    <Card id="history" className="rounded-[28px] shadow-sm">
      <CardHeader>
        <CardTitle>Как это получилось</CardTitle>
        <CardDescription>
          Пример для других районов: обращения жителей, реакция муниципалитета,
          ремонт и дальнейшая обратная связь.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {[
          ["24.10.2023", "МО Обуховский отремонтировал Пролетарский корт."],
          ["01.11.2023", "Состоялась встреча с главой МО Обуховский."],
          ["2025-2026", "Сообщество собирает обратную связь и ведёт заявки."],
        ].map(([date, text]) => (
          <div key={date} className="grid grid-cols-[88px_1fr] gap-3">
            <Badge variant="outline">{date}</Badge>
            <p className="text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MaintenanceSection({
  maintenance,
}: {
  maintenance: MaintenanceItem[];
}) {
  return (
    <Card id="maintenance" className="rounded-[28px] shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-secondary">
            <Wrench data-icon="inline-start" />
          </span>
          <div>
            <CardTitle>Уход за кортом</CardTitle>
            <CardDescription>
              Публичная лента заявок и результатов обслуживания.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {maintenance.map((item, index) => (
          <div key={item.id} className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{statusLabels[item.status]}</Badge>
              <span className="text-sm text-muted-foreground">
                {new Intl.DateTimeFormat("ru-RU").format(new Date(item.date))}
                {" · "}
                {courtName(item.courtId)}
              </span>
            </div>
            <div>
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.summary}</p>
            </div>
            {index < maintenance.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CommunitySection() {
  return (
    <Card id="community" className="scroll-mt-28 rounded-[28px] shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-secondary">
            <MessageCircle data-icon="inline-start" />
          </span>
          <div>
            <CardTitle>Сообщество в Telegram</CardTitle>
            <CardDescription>
              Чат остаётся местом общения, правил, обсуждений и уведомлений.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-muted-foreground">
        <p>
          В теме записи допустимы только записи, отмены, сообщения “занято” и
          объявления администратора. Общие вопросы, поиск партнёров и обсуждения
          уходят в основной чат.
        </p>
        <a
          href="https://t.me/prolettennis"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 font-medium text-foreground"
        >
          <CheckCircle2 data-icon="inline-start" />
          Открыть @prolettennis
        </a>
      </CardContent>
    </Card>
  );
}

function RuleStep({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid min-h-44 gap-3 border-b border-foreground/10 p-5 first:bg-secondary/60 last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0">
      <Badge className="w-fit rounded-full px-3" variant="secondary">
        {index}
      </Badge>
      <h3 className="text-xl font-extrabold leading-tight">{title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{children}</p>
    </div>
  );
}
