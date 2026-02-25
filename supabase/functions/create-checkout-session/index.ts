import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map dollar amounts to Stripe price IDs
const PRICE_MAP: Record<number, string> = {
  5: "price_1T4poxENNBIo08B2uB9Q5Iqb",
  10: "price_1T4pp3ENNBIo08B24pOdQzf3",
  20: "price_1T4pp4ENNBIo08B2p0jjEDwT",
  50: "price_1T4pp5ENNBIo08B2f56HYYDs",
  100: "price_1T4pp6ENNBIo08B2KGuxemyY",
  200: "price_1T4pp7ENNBIo08B2J2uAIxJA",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cell_index } = await req.json();

    if (cell_index === undefined || cell_index === null) {
      throw new Error("cell_index is required");
    }

    // Use service role to bypass RLS for status updates
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if cell is still empty
    const { data: cell, error: cellError } = await supabase
      .from("grid_cells")
      .select("*")
      .eq("cell_index", cell_index)
      .single();

    if (cellError || !cell) {
      throw new Error("Cell not found");
    }

    if (cell.status !== "empty") {
      throw new Error("Cell is already taken");
    }

    const priceId = PRICE_MAP[cell.amount];
    if (!priceId) {
      throw new Error(`No price configured for amount $${cell.amount}`);
    }

    // Mark cell as pending
    const { error: updateError } = await supabase
      .from("grid_cells")
      .update({ status: "pending" })
      .eq("cell_index", cell_index)
      .eq("status", "empty");

    if (updateError) {
      throw new Error("Failed to reserve cell");
    }

    // Create Stripe checkout session
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/?success=true&cell=${cell_index}`,
      cancel_url: `${req.headers.get("origin")}/?canceled=true&cell=${cell_index}`,
      metadata: { cell_index: cell_index.toString() },
    });

    // Store session ID on the cell for webhook verification
    await supabase
      .from("grid_cells")
      .update({ stripe_session_id: session.id })
      .eq("cell_index", cell_index);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
