import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Invoices</h1>
        <p className="mt-1 text-sm text-zinc-500">Sign in to manage your jobs and invoices.</p>
      </div>
      <LoginForm />
    </div>
  );
}
