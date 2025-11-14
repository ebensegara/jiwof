"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface QRISPaymentModalProps {
  open: boolean;
  onClose: () => void;
  paymentData: {
    payment_id: string;
    qris_link: string;
    ref_code: string;
    amount: number;
  };
  onSuccess: () => void;
}

export default function QRISPaymentModal({
  open,
  onClose,
  paymentData,
  onSuccess,
}: QRISPaymentModalProps) {
  const [status, setStatus] = useState<"pending" | "paid" | "failed">("pending");
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!open || !polling) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/payment/qris?ref_code=${paymentData.ref_code}`
        );
        const result = await response.json();

        if (result.success && result.payment.status === "paid") {
          setStatus("paid");
          setPolling(false);
          setTimeout(() => {
            onSuccess();
          }, 2000);
        } else if (result.payment.status === "failed") {
          setStatus("failed");
          setPolling(false);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [open, polling, paymentData.ref_code, onSuccess]);

  const handleSimulatePayment = async () => {
    // For demo purposes - simulate successful payment
    try {
      const response = await fetch("/api/payment/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref_code: paymentData.ref_code,
          status: "paid",
          transaction_status: "settlement",
        }),
      });

      if (response.ok) {
        setStatus("paid");
        setPolling(false);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error("Error simulating payment:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {status === "pending" && "Scan QR Code to Pay"}
            {status === "paid" && "Payment Successful!"}
            {status === "failed" && "Payment Failed"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {status === "pending" && `Amount: Rp ${paymentData.amount.toLocaleString()}`}
            {status === "paid" && "Your payment has been confirmed"}
            {status === "failed" && "Please try again"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {status === "pending" && (
            <>
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={paymentData.qris_link} size={200} />
              </div>
              <p className="text-sm text-muted-foreground">
                Ref: {paymentData.ref_code}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Waiting for payment...
              </div>
              
              {/* Demo button - remove in production */}
              <Button
                onClick={handleSimulatePayment}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Simulate Payment (Demo)
              </Button>
            </>
          )}

          {status === "paid" && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-lg font-semibold">Payment Confirmed!</p>
            </div>
          )}

          {status === "failed" && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-lg font-semibold">Payment Failed</p>
              <Button onClick={onClose}>Try Again</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
