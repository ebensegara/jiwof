"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function WeeklyInsight() {
  return (
    <Card className="bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#756657]" />
          Weekly Insights
        </CardTitle>
        <CardDescription>
          View your personalized mental health analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 mx-auto text-[#756657] mb-4" />
          <p className="text-muted-foreground">
            Weekly insights feature coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
