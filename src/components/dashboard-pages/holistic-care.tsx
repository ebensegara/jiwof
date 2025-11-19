"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default function HolisticCare() {
  return (
    <Card className="bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-[#756657]" />
          Holistic Care
        </CardTitle>
        <CardDescription>
          Find your flow with guided yoga practices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto text-[#756657] mb-4" />
          <p className="text-muted-foreground">
            Holistic care feature coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
