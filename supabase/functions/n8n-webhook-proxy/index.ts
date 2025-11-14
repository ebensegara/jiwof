import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const N8N_WEBHOOK_URL = "https://dindon.app.n8n.cloud/webhook/jiwohook";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, userId, timestamp } = await req.json();

    console.log("=== INCOMING REQUEST ===");
    console.log("Proxying request to n8n:", { message, userId });

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        userId,
        timestamp,
      }),
    });

    console.log("=== N8N RESPONSE ===");
    console.log("n8n response status:", response.status);
    console.log("n8n response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`n8n webhook returned status ${response.status}`);
    }

    const text = await response.text();
    console.log("=== RAW RESPONSE ===");
    console.log("n8n raw response text:", text);
    console.log("Response length:", text.length);

    let data;
    if (text && text.trim().length > 0) {
      try {
        const parsed = JSON.parse(text);
        console.log("=== PARSED RESPONSE ===");
        console.log("n8n parsed data:", JSON.stringify(parsed, null, 2));

        // Handle n8n array response format: [{ "output": "..." }]
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].output) {
          data = { message: parsed[0].output };
          console.log("✅ Extracted from array output:", data.message);
        }
        // Handle direct object with output field: { "output": "..." }
        else if (parsed.output) {
          data = { message: parsed.output };
          console.log("✅ Extracted from output field:", data.message);
        }
        // Handle standard message field: { "message": "..." }
        else if (parsed.message) {
          data = { message: parsed.message };
          console.log("✅ Using message field:", data.message);
        }
        // Fallback: use entire response as message
        else {
          data = { message: text };
          console.log("⚠️ Using raw text as message");
        }
      } catch (e) {
        console.log("⚠️ Failed to parse JSON, using text as message");
        data = { message: text };
      }
    } else {
      console.log("❌ EMPTY RESPONSE FROM N8N - WORKFLOW MIGHT NOT BE ACTIVE");
      data = {
        message:
          "Thank you for sharing. I'm here to support you on your mental health journey.",
      };
    }

    console.log("=== FINAL RESPONSE ===");
    console.log("Final response to return:", JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ PROXY ERROR:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        message:
          "Thank you for sharing. I'm here to support you on your mental health journey.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  }
});