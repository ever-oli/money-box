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
    const { cell_index, box_id } = await req.json();

    if (cell_index === undefined || cell_index === null) {
      throw new Error("cell_index is required");
    }
    if (!box_id) {
      throw new Error("box_id is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the box to find the connected Stripe account
    const { data: box, error: boxError } = await supabase
      .from("savings_boxes")
      .select("*")
      .eq("id", box_id)
      .single();

    if (boxError || !box) throw new Error("Box not found");
    if (!box.stripe_account_id || !box.stripe_onboarding_complete) {
      throw new Error("This box is not set up for payments yet");
    }

    // Check if cell is still empty
    const { data: cell, error: cellError } = await supabase
      .from("grid_cells")
      .select("*")
      .eq("cell_index", cell_index)
      .eq("box_id", box_id)
      .single();

    if (cellError || !cell) throw new Error("Cell not found");
    if (cell.status !== "empty") throw new Error("Cell is already taken");

    // Mark cell as pending
    const { error: updateError } = await supabase
      .from("grid_cells")
      .update({ status: "pending" })
      .eq("cell_index", cell_index)
      .eq("box_id", box_id)
      .eq("status", "empty");

    if (updateError) throw new Error("Failed to reserve cell");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    // Create checkout session with destination charge to connected account
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${box.title} - Cell #${cell_index}`,
              description: `Contribution of $${cell.amount} to "${box.title}"`,
            },
            unit_amount: Math.round(cell.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/box/${box.slug}?success=true&cell=${cell_index}`,
      cancel_url: `${req.headers.get("origin")}/box/${box.slug}?canceled=true&cell=${cell_index}`,
      metadata: { cell_index: cell_index.toString(), box_id },
      payment_intent_data: {
        application_fee_amount: Math.round(cell.amount * 5), // 5% platform fee (in cents)
        transfer_data: {
          destination: box.stripe_account_id,
        },
      },
    });

    // Store session ID
    await supabase
      .from("grid_cells")
      .update({ stripe_session_id: session.id })
      .eq("cell_index", cell_index)
      .eq("box_id", box_id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
