"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import QRISPaymentModal from "@/components/qris-payment-modal";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("price", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast({
        title: "Error",
        description: "Failed to load plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    try {
      setSelectedPlan(plan);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // Create payment
      const response = await fetch("/api/payment/qris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          amount: plan.price,
          payment_type: "subscription",
          metadata: {
            plan_id: plan.id,
            plan_name: plan.name,
            duration_days: plan.duration_days,
          },
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPaymentData(result);
        setShowQRModal(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = () => {
    setShowQRModal(false);
    toast({
      title: "Subscription Active! 🎉",
      description: "Your subscription has been activated successfully",
    });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#e6e2df] to-[#9e8d7d] dark:from-[#1a1618] dark:to-[#4d4349]">
        <Loader2 className="h-8 w-8 animate-spin text-[#756657]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6e2df] to-[#9e8d7d] dark:from-[#1a1618] dark:to-[#4d4349] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#756657] dark:text-[#e6e2df] mb-2">
            Choose Your Plan
          </h1>
          <p className="text-[#9e8d7d] dark:text-[#7c6a76]">
            Upgrade your mental wellness journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="relative bg-white dark:bg-[#1a1618] border-[#9e8d7d]/20"
            >
              {plan.name === "Premium" && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#756657] text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl text-[#756657] dark:text-[#e6e2df]">
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-[#756657] dark:text-[#e6e2df]">
                    Rp {plan.price.toLocaleString()}
                  </span>
                  <span className="text-[#9e8d7d] dark:text-[#7c6a76]">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#756657] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#9e8d7d] dark:text-[#7c6a76]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan)}
                  className="w-full bg-[#756657] hover:bg-[#756657]/90 text-white"
                >
                  Subscribe Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {showQRModal && paymentData && (
        <QRISPaymentModal
          open={showQRModal}
          onClose={() => setShowQRModal(false)}
          paymentData={paymentData}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
