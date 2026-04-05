import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2025-08-27.basil",
  });

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  // If we have a webhook secret, verify the signature
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (webhookSecret && signature) {
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }
  } else {
    // For development, parse directly
    event = JSON.parse(body);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const cellIndex = session.metadata?.cell_index;

    if (cellIndex !== undefined) {
      const { error } = await supabase
        .from("grid_cells")
        .update({ status: "filled", stripe_session_id: session.id })
        .eq("cell_index", parseInt(cellIndex));

      if (error) {
        console.error("Failed to update cell:", error);
        return new Response(JSON.stringify({ error: "DB update failed" }), { status: 500 });
      }

      console.log(`Cell ${cellIndex} marked as filled`);
    }
  }

  // Handle canceled/expired sessions - revert to empty
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const cellIndex = session.metadata?.cell_index;

    if (cellIndex !== undefined) {
      await supabase
        .from("grid_cells")
        .update({ status: "empty", stripe_session_id: null })
        .eq("cell_index", parseInt(cellIndex))
        .eq("status", "pending");
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
