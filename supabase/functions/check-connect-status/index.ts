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

  try {
    const { box_id } = await req.json();
    if (!box_id) throw new Error("box_id is required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: box, error } = await supabase
      .from("savings_boxes")
      .select("stripe_account_id, stripe_onboarding_complete")
      .eq("id", box_id)
      .single();

    if (error || !box || !box.stripe_account_id) {
      return new Response(JSON.stringify({ complete: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (box.stripe_onboarding_complete) {
      return new Response(JSON.stringify({ complete: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check with Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    const account = await stripe.accounts.retrieve(box.stripe_account_id);

    if (account.charges_enabled && account.payouts_enabled) {
      await supabase
        .from("savings_boxes")
        .update({ stripe_onboarding_complete: true })
        .eq("id", box_id);

      return new Response(JSON.stringify({ complete: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ complete: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Check connect status error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
