import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export const dynamic = "force-static";

export default function LoginPage() {
  return (
    <div className="py-10">
      <Suspense fallback={<div className="text-center text-sm text-black/50">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
