"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

export default function ArtTherapy() {
  return (
    <Card className="bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-[#756657]" />
          Art Therapy
        </CardTitle>
        <CardDescription>
          Express yourself through creative healing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Palette className="h-16 w-16 mx-auto text-[#756657] mb-4" />
          <p className="text-muted-foreground">
            Art therapy feature coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
