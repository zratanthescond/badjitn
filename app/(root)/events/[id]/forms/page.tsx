import { redirect } from "next/navigation";

// Custom forms are now standalone - redirect to the profile forms tab
export default function EventFormRedirectPage() {
    redirect("/profile?tab=forms");
}
