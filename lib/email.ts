import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLeadEmail({
  to,
  productName,
  buyerName,
  buyerPhone,
  buyerEmail,
  message,
}: {
  to: string;
  productName: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  message?: string;
}) {
  try {
    await resend.emails.send({
      from: "GreenFarm <leads@greenfarm.app>",
      to,
      subject: `New enquiry for ${productName}`,
      html: `
        <h2>New Product Enquiry</h2>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Name:</strong> ${buyerName}</p>
        <p><strong>Phone:</strong> ${buyerPhone}</p>
        ${buyerEmail ? `<p><strong>Email:</strong> ${buyerEmail}</p>` : ""}
        ${message ? `<p><strong>Message:</strong><br/>${message}</p>` : ""}
      `,
    });
  } catch (err) {
    console.error("Email failed:", err);
  }
}
