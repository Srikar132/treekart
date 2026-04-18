export default async function TreeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="section container">
      <div className="section-header">
        <h1>Tree Details</h1>
        <p className="p-base">Tree ID: {id}</p>
      </div>
    </main>
  );
}
