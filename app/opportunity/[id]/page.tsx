export default function OpportunityPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen p-8">
      <h1 className="font-display text-2xl">Opportunity {params.id}</h1>
      <p className="text-ink-muted mt-2">Coming in Phase 9.</p>
    </main>
  );
}
