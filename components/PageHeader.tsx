export default function PageHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur px-4 py-4">
      <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
    </header>
  );
}
