import { headers } from "next/headers";
import crypto from "crypto";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const rawBody = await req.text();

  /* ✅ PATCH: await headers() */
  const signature = (await headers()).get("x-paystack-signature");

  if (process.env.PAYSTACK_SECRET_KEY && signature) {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return new Response("Invalid signature", { status: 401 });
    }
  }

  const body = JSON.parse(rawBody);

  if (body?.event !== "charge.success") {
    return Response.json({});
  }

  const meta = body?.data?.metadata;

  if (!meta?.vendorId || !meta?.leadId) {
    return Response.json({});
  }

  const supabase = await supabaseServer();

  await supabase
    .from("lead_unlocks")
    .upsert(
      {
        vendor_id: meta.vendorId,
        lead_id: meta.leadId,
        amount: body.data.amount / 100,
        paid: true,
        paystack_ref: body.data.reference,
      },
      {
        onConflict: "vendor_id,lead_id",
      }
    );

  return Response.json({ received: true });
}
