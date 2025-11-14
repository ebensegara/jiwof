"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Heart,
  Sparkles,
  Moon,
  CloudRain,
  Briefcase,
  Users,
  BookOpen,
  Baby,
  HeartCrack,
  Battery,
  Smile,
  UserX,
  AlertTriangle,
} from "lucide-react";

interface TopicSelectionProps {
  onTopicSelect: (topic: string, webhookUrl: string) => void;
}

const topics = [
  {
    id: "anxiety",
    title: "Teman Curhat",
    icon: AlertTriangle,
    color: "bg-[#756657]/10 border-[#756657]/30",
    iconColor: "text-[#0f0e0d]",
    webhookUrl: "https://dindon.app.n8n.cloud/webhook/mindfullnessx1",
  },
  {
    id: "motivation",
    title: "Midfullness",
    icon: Sparkles,
    color:
      "bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    webhookUrl: "https://dindon.app.n8n.cloud/webhook/mindfullnessx1",
  },
  {
    id: "confidence",
    title: "Hubungan Sosial",
    icon: Smile,
    color:
      "bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    webhookUrl: "https://dindon.app.n8n.cloud/webhook/social",
  },
  {
    id: "sleep",
    title: "Produktifitas Kerja",
    icon: Moon,
    color:
      "bg-indigo-100 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    webhookUrl: "https://dindon.app.n8n.cloud/webhook/productivity",
  },
  {
    id: "depression",
    title: "Spiritual",
    icon: CloudRain,
    color:
      "bg-slate-100 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800",
    iconColor: "text-slate-600 dark:text-slate-400",
    webhookUrl: "https://dindon.app.n8n.cloud/webhook/spiritual",
  },
  {
    id: "workstress",
    title: "Work Stress",
    icon: Briefcase,
    color:
      "bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    iconColor: "text-orange-600 dark:text-orange-400",
    webhookUrl: "https://dindon.app.n8n.cloud/webhook/jiwohook",
  },
  {
    id: "relationship",
    title: "Relationship",
    icon: Users,
    color:
      "bg-pink-100 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
    iconColor: "text-pink-600 dark:text-pink-400",
    webhookUrl: "https://dindon.app.n8n.cloud/webhook/jiwohook",
  },
  {
    id: "examstress",
    title: "Exam Stress",
    icon: BookOpen,
    color:
      "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    webhookUrl: "https://dindon.app.n8n.cloud/webhook/jiwohook",
  },
  {
    id: "pregnancy",
    title: "Pregnancy",
    icon: Baby,
    color:
      "bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    iconColor: "text-purple-600 dark:text-purple-400",
    webhookUrl: "https://dindon.app.n8n.cloud/webhook/jiwohook",
  },
  {
    id: "loss",
    title: "Loss",
    icon: HeartCrack,
    color:
      "bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
    webhookUrl: "https://dindon.app.n8n.cloud/webhook/jiwohook",
  },
  {
    id: "lowenergy",
    title: "Low Energy",
    icon: Battery,
    color:
      "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    webhookUrl: "https://dindon.app.n8n.cloud/webhook/jiwohook",
  },
  {
    id: "selfesteem",
    title: "Self Esteem",
    icon: Heart,
    color: "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    webhookUrl: "https://dindon.app.n8n.cloud/webhook/jiwohook",
  },
  {
    id: "loneliness",
    title: "Loneliness",
    icon: UserX,
    color:
      "bg-cyan-100 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    webhookUrl: "https://dindon.app.n8n.cloud/webhook/jiwohook",
  },
  {
    id: "trauma",
    title: "Trauma",
    icon: Brain,
    color:
      "bg-violet-100 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800",
    iconColor: "text-violet-600 dark:text-violet-400",
    webhookUrl: "https://n8n.srv1104373.hstgr.cloud/webhook/jiwoh1",
  },
];

export default function TopicSelection({ onTopicSelect }: TopicSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What's on your mind?
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose the topics below to start conversation
          </p>
        </div>

        {/* Topic Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Card
                key={topic.id}
                className={`${topic.color} cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2`}
                onClick={() => onTopicSelect(topic.title, topic.webhookUrl)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                  <div
                    className={`p-4 rounded-full bg-white/50 dark:bg-black/20`}
                  >
                    <Icon className={`h-8 w-8 ${topic.iconColor}`} />
                  </div>
                  <h3
                    className={`font-semibold text-sm md:text-base ${topic.iconColor}`}
                  >
                    {topic.title}
                  </h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
