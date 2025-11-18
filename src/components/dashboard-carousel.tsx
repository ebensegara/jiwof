"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Heart, BookOpen, MessageCircle, Users, ClipboardList, TrendingUp, Palette } from "lucide-react";
import MoodCheckin from "@/components/mood-checkin";
import Journal from "@/components/journal";
import AIChat from "@/components/ai-chat";
import ProfessionalList from "@/components/professional-list";
import SelfScreening from "@/components/dashboard-pages/self-screening";
import WeeklyInsight from "@/components/dashboard-pages/weekly-insight";
import HolisticCare from "@/components/dashboard-pages/holistic-care";
import ArtTherapy from "@/components/dashboard-pages/art-therapy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pages = [
  {
    id: "mood",
    title: "Mood Check-in",
    icon: Heart,
    component: MoodCheckin,
  },
  {
    id: "journal",
    title: "Journal",
    icon: BookOpen,
    component: Journal,
  },
  {
    id: "chat",
    title: "AI Chat",
    icon: MessageCircle,
    component: AIChat,
  },
  {
    id: "professionals",
    title: "Professionals",
    icon: Users,
    component: () => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connect with Professionals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfessionalList category="all" />
        </CardContent>
      </Card>
    ),
  },
  {
    id: "screening",
    title: "Self Screening",
    icon: ClipboardList,
    component: SelfScreening,
  },
  {
    id: "insights",
    title: "Weekly Insights",
    icon: TrendingUp,
    component: WeeklyInsight,
  },
  {
    id: "holistic",
    title: "Holistic Care",
    icon: Heart,
    component: HolisticCare,
  },
  {
    id: "art",
    title: "Art Therapy",
    icon: Palette,
    component: ArtTherapy,
  },
];

export default function DashboardCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: "start",
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  return (
    <div className="w-full">
      {/* Navigation Bar */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {pages.map((page, index) => {
            const Icon = page.icon;
            const isActive = selectedIndex === index;
            return (
              <button
                key={page.id}
                onClick={() => scrollTo(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#756657] text-white shadow-md"
                    : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{page.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {pages.map((page) => {
            const Component = page.component;
            return (
              <div
                key={page.id}
                className="flex-[0_0_100%] min-w-0"
              >
                <div className="px-1">
                  <Component />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {pages.map((page, index) => (
          <button
            key={page.id}
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all ${
              selectedIndex === index
                ? "w-8 bg-[#756657]"
                : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
            }`}
            aria-label={`Go to ${page.title}`}
          />
        ))}
      </div>
    </div>
  );
}
