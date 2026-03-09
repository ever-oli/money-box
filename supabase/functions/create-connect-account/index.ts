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

    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    // Service role client for updates
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify box ownership
    const { data: box, error: boxError } = await supabase
      .from("savings_boxes")
      .select("*")
      .eq("id", box_id)
      .eq("owner_id", user.id)
      .single();

    if (boxError || !box) throw new Error("Box not found or not owned by you");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    // If box already has a Stripe account, generate a new onboarding link
    if (box.stripe_account_id) {
      const accountLink = await stripe.accountLinks.create({
        account: box.stripe_account_id,
        refresh_url: `${req.headers.get("origin")}/dashboard`,
        return_url: `${req.headers.get("origin")}/dashboard?stripe_connected=true&box=${box_id}`,
        type: "account_onboarding",
      });
      return new Response(JSON.stringify({ url: accountLink.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a new Standard connected account
    const account = await stripe.accounts.create({
      type: "standard",
      email: user.email,
      metadata: { box_id, user_id: user.id },
    });

    // Save account ID to the box
    await supabase
      .from("savings_boxes")
      .update({ stripe_account_id: account.id })
      .eq("id", box_id);

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.get("origin")}/dashboard`,
      return_url: `${req.headers.get("origin")}/dashboard?stripe_connected=true&box=${box_id}`,
      type: "account_onboarding",
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Create connect account error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
