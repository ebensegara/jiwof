"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  Heart,
  BookOpen,
  MessageCircle,
  Users,
  ClipboardList,
  TrendingUp,
  Palette,
  Wind,
} from "lucide-react";
import MoodCheckin from "@/components/mood-checkin";
import Journal from "@/components/journal";
import AIChat from "@/components/ai-chat";
import ProfessionalList from "@/components/professional-list";
import SelfScreening from "@/components/dashboard-pages/self-screening";
import WeeklyInsight from "@/components/dashboard-pages/weekly-insight";
import HolisticCare from "@/components/dashboard-pages/holistic-care";
import ArtTherapy from "@/components/dashboard-pages/art-therapy";
import Relaxation from "@/components/dashboard-pages/relaxation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pages = [
  {
    id: "mood",
    title: "Mood Check-in",
    icon: Heart,
    component: MoodCheckin,
    bgColor: "bg-[#FF6961]", //  *Beige terang
    activeBg: "bg-[#C4AB9C]", // Taupe
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "journal",
    title: "Journal",
    icon: BookOpen,
    component: Journal,
    bgColor: "bg-[#FFDFD3]", // Beige medium
    activeBg: "bg-[#A89080]", // Coklat medium
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "chat",
    title: "AI Chat",
    icon: MessageCircle,
    component: AIChat,
    bgColor: "bg-[#FDFD96]", // Cream
    activeBg: "bg-[#8B7968]", // Coklat gelap
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "relaxation",
    title: "Relaksasi",
    icon: Wind,
    component: Relaxation,
    bgColor: "bg-[#c8ff93]", // Sandy beige
    activeBg: "bg-[#9A8272]", // Warm taupe
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
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
          <ProfessionalList category="all" embedded={true} />
        </CardContent>
      </Card>
    ),
    bgColor: "bg-[#B3DDC4]", // Dusty beige
    activeBg: "bg-[#7D6B5C]", // Dark taupe
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "screening",
    title: "Self Screening",
    icon: ClipboardList,
    component: SelfScreening,
    bgColor: "bg-[#AEC6CF]", // Light tan
    activeBg: "bg-[#B89B88]", // Warm brown
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "insights",
    title: "Weekly Insights",
    icon: TrendingUp,
    component: WeeklyInsight,
    bgColor: "bg-[#e8fafe]", // Pale cream
    activeBg: "bg-[#A38E7E]", // Medium taupe
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "holistic",
    title: "Holistic Care",
    icon: Heart,
    component: HolisticCare,
    bgColor: "bg-[#E0BBE4]", // Warm beige
    activeBg: "bg-[#91786A]", // Rich taupe
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "art",
    title: "Art Therapy",
    icon: Palette,
    component: ArtTherapy,
    bgColor: "bg-[#CFC1E8]", // Soft beige
    activeBg: "bg-[#8F7A6B]", // Muted brown
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
];

export default function DashboardCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="w-full">
      {/* Navigation Bar */}
      <div className="mb-8 overflow-x-auto pb-3 scrollbar-hide">
        <div className="flex gap-3 min-w-max px-1">
          {pages.map((page, index) => {
            const Icon = page.icon;
            const isActive = selectedIndex === index;
            return (
              <button
                key={page.id}
                onClick={() => scrollTo(index)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all whitespace-nowrap shadow-md hover:shadow-lg transform hover:scale-105 ${
                  isActive
                    ? `${page.activeBg} ${page.activeText} shadow-xl scale-105`
                    : `${page.bgColor} ${page.textColor} hover:brightness-95`
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-base font-semibold">{page.title}</span>
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
              <div key={page.id} className="flex-[0_0_100%] min-w-0">
                <div className="px-1">
                  <Component />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-3 mt-8">
        {pages.map((page, index) => (
          <button
            key={page.id}
            onClick={() => scrollTo(index)}
            className={`h-2.5 rounded-full transition-all shadow-sm ${
              selectedIndex === index
                ? `w-10 ${page.activeBg} shadow-md`
                : `w-2.5 ${page.bgColor} hover:brightness-90`
            }`}
            aria-label={`Go to ${page.title}`}
          />
        ))}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
