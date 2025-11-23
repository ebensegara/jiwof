"use client";

import { useState, useEffect } from "react";
import { supabase, getSafeUser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import QrisSubscription from "@/components/qris-subscription";
import DashboardCarousel from "@/components/dashboard-carousel";

export default function UserDashboard() {
  const [userName, setUserName] = useState("");
  const [showSubscription, setShowSubscription] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = await getSafeUser();
      if (!user) {
        router.replace("/auth");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (userData) {
        setUserName(userData.full_name || user.email?.split("@")[0] || "User");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      router.replace('/welcome');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Welcome back, {userName}!
              </h1>
              <p className="text-sm text-muted-foreground">
                Your mental wellness journey continues here
              </p>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Collapsible Subscription Banner */}
        {showSubscription && (
          <div className="mb-8 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/30 rounded-lg overflow-hidden">
              {/* Compact View */}
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="font-medium text-gray-800 dark:text-white truncate">
                    Upgrade to Premium
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span className="hidden sm:inline">Hide</span>
                      </>
                    ) : (
                      <>
                        <span>View Plans</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSubscription(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded View */}
              {isExpanded && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-1 duration-200">
                  <QrisSubscription />
                </div>
              )}
            </div>
          </div>
        )}

        <DashboardCarousel />
      </main>
    </div>
  );
}