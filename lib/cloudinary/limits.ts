import { resolveVendorPlan } from "@/lib/vendorPlan"

export function getUploadPolicy(plan?: string) {
  const p = resolveVendorPlan(plan)

  return {
    maxFiles: p.key === "FREE" ? 5 : Infinity,
    allowVideo: p.key !== "FREE",
    quality: p.key === "FREE" ? "auto:low" : "auto",
  }
}
