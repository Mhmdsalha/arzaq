import { sendEmailVerificationCode } from "../src/lib/email";

async function main() {
  const to = process.argv[2];

  if (!to) {
    console.error("Usage: npm run email:test -- your-email@example.com");
    process.exit(1);
  }

  const result = await sendEmailVerificationCode({
    to,
    name: "مستخدم أرزاق",
    code: "123456",
  });

  if (!result.sent) {
    console.error(`Email failed: ${result.reason}`);
    process.exit(1);
  }

  console.log("Email sent successfully");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
