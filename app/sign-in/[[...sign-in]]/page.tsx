import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white"
          }
        }}
        redirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  );
}

