import { redirect } from "next/navigation";

export const metadata = {
  title: "الطلبات الواردة",
};

export default function ReceivedOrdersPage() {
  redirect("/dashboard/store");
}
