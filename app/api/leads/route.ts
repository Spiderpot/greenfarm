import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* =====================================================
   SAFE SUPABASE FACTORY (NO TOP LEVEL INIT)
===================================================== */

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/* =====================================================
   TYPES
===================================================== */

type LeadRow = {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  created_at: string;
  contacted: boolean;
  product_id: string;
};

type UnlockRow = {
  lead_id: string;
  vendor_id: string;
};

/* =====================================================
   GET → Fetch vendor leads
===================================================== */

export async function GET(req: Request) {
  try {
    const supabase = getSupabase(); // ✅ INIT HERE

    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json(
        { error: "vendorId required" },
        { status: 400 }
      );
    }

    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (leadsError) throw leadsError;

    const { data: unlocks } = await supabase
      .from("lead_unlocks")
      .select("lead_id,vendor_id")
      .eq("vendor_id", vendorId);

    const unlockedSet = new Set(
      (unlocks as UnlockRow[] | null)?.map((u) => u.lead_id)
    );

    const formatted = (leads as LeadRow[]).map((lead) => ({
      id: lead.id,
      buyer_name: lead.buyer_name,
      buyer_phone: lead.buyer_phone,
      product_name: "",
      created_at: lead.created_at,
      contacted: lead.contacted,
      unlocked: unlockedSet.has(lead.id),
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Fetch leads error:", err);

    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

/* =====================================================
   POST → Create new lead
===================================================== */

export async function POST(req: Request) {
  try {
    const supabase = getSupabase(); // ✅ INIT HERE

    const body = await req.json();

    const {
      buyer_name,
      buyer_phone,
      buyer_email,
      message,
      product_id,
    } = body;

    const { data, error } = await supabase
      .from("leads")
      .insert({
        buyer_name,
        buyer_phone,
        buyer_email,
        message,
        product_id,
        contacted: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error("Create lead error:", err);

    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
