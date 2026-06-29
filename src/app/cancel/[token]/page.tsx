import Link from "next/link";

import { CancelForm } from "@/components/cancel-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CancelPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className="mx-auto grid min-h-screen max-w-xl place-items-center px-4 py-12">
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Отмена записи</CardTitle>
          <CardDescription>
            Эта ссылка отменяет только ту запись, для которой она была создана.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <CancelForm token={token} />
          <Link href="/" className="text-sm text-muted-foreground underline">
            Вернуться к расписанию
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
