import { notFound } from "next/navigation";

export const metadata = {
  title: "غير موجود",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLoginPage() {
  notFound();
}
