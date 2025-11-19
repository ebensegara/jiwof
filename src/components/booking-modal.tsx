"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase, getSafeUser } from "@/lib/supabase";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import QRISPaymentModal from "./qris-payment-modal";
import { format } from "date-fns";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  professional: {
    id: string;
    full_name: string;
    price_per_session: number;
  };
  onSuccess: () => void;
}

export default function BookingModal({
  open,
  onClose,
  professional,
  onSuccess,
}: BookingModalProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const { toast } = useToast();

  const timeSlots = [
    "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const handleBookSession = async () => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const user = await getSafeUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please login to book a session",
          variant: "destructive",
        });
        return;
      }

      // Combine date and time
      const sessionDateTime = new Date(date);
      const [hours, minutes] = time.split(":");
      sessionDateTime.setHours(parseInt(hours), parseInt(minutes));

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          professional_id: professional.id,
          session_time: sessionDateTime.toISOString(),
          price: professional.price_per_session,
          status: "pending",
          notes,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create payment
      const response = await fetch("/api/payment/qris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          amount: professional.price_per_session,
          payment_type: "booking",
          metadata: {
            booking_id: booking.id,
            professional_name: professional.full_name,
            session_time: sessionDateTime.toISOString(),
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
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowQRModal(false);
    onClose();
    toast({
      title: "Booking Confirmed! 🎉",
      description: "Your session has been booked successfully",
    });
    onSuccess();
  };

  // Disable past dates
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <>
      <Dialog open={open && !showQRModal} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Session with {professional.full_name}</DialogTitle>
            <DialogDescription>
              Price: Rp {professional.price_per_session.toLocaleString()} per session
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Select Date
              </Label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={disabledDays}
                  className="rounded-md border bg-white dark:bg-slate-800"
                  initialFocus
                />
              </div>
              {date && (
                <p className="text-sm text-center mt-2 text-[#756657] dark:text-[#e6e2df] font-medium">
                  Selected: {format(date, "EEEE, MMMM d, yyyy")}
                </p>
              )}
            </div>

            <div>
              <Label className="text-base font-semibold mb-3">Select Time</Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={time === slot ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTime(slot)}
                    className={time === slot ? "bg-[#756657] hover:bg-[#756657]/90" : ""}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-2">Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific concerns or topics you'd like to discuss..."
                className="mt-2 min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleBookSession}
              disabled={loading || !date}
              className="w-full bg-[#756657] hover:bg-[#756657]/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showQRModal && paymentData && (
        <QRISPaymentModal
          open={showQRModal}
          onClose={() => setShowQRModal(false)}
          paymentData={paymentData}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}