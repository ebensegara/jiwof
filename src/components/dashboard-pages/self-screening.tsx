"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function SelfScreening() {
  return (
    <Card className="bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[#756657]" />
          Self Screening
        </CardTitle>
        <CardDescription>
          Take a quick assessment of your mental health
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <ClipboardList className="h-16 w-16 mx-auto text-[#756657] mb-4" />
          <p className="text-muted-foreground">
            Self screening feature coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
