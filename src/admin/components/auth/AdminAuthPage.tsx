import type { ReactNode } from "react";
import { AppLink } from "@/components/ui/app-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function AdminAuthPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <AppLink href="/" aria-label="HBS HOME — Accueil" className="mb-5 inline-flex">
            <BrandLogo className="h-12 w-[5.1rem]" />
          </AppLink>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}
