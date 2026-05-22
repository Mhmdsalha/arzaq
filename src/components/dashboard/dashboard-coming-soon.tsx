import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-primary-dark">قيد البناء</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">{description}</p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">العودة للوحة التحكم</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
