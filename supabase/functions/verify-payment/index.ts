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
    const { cell_index } = await req.json();

    if (cell_index === undefined || cell_index === null) {
      throw new Error("cell_index is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the cell and its stripe session ID
    const { data: cell, error: cellError } = await supabase
      .from("grid_cells")
      .select("*")
      .eq("cell_index", cell_index)
      .single();

    if (cellError || !cell) {
      throw new Error("Cell not found");
    }

    // If already filled, nothing to do
    if (cell.status === "filled") {
      return new Response(JSON.stringify({ status: "already_filled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If no stripe session, can't verify
    if (!cell.stripe_session_id) {
      throw new Error("No Stripe session found for this cell");
    }

    // Verify with Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(cell.stripe_session_id);

    if (session.payment_status === "paid") {
      // Mark as filled
      const { error: updateError } = await supabase
        .from("grid_cells")
        .update({ status: "filled" })
        .eq("cell_index", cell_index);

      if (updateError) {
        throw new Error("Failed to update cell");
      }

      return new Response(JSON.stringify({ status: "filled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // Payment not completed - revert to empty
      await supabase
        .from("grid_cells")
        .update({ status: "empty", stripe_session_id: null })
        .eq("cell_index", cell_index)
        .eq("status", "pending");

      return new Response(JSON.stringify({ status: "not_paid", payment_status: session.payment_status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
