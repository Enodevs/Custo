import { Suspense } from "react";
import ComplaintIntake from "@/components/complaint-intake";

function SupportLoading() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-3xl animate-pulse">
        <div className="mb-4 h-8 w-48 rounded bg-muted" />
        <div className="mb-8 h-4 w-72 rounded bg-muted" />
        <div className="h-96 rounded-xl bg-muted" />
      </div>
    </main>
  );
}

async function ProductPageContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ComplaintIntake slug={slug} />;
}

export default function PublicProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<SupportLoading />}>
      <ProductPageContent params={params} />
    </Suspense>
  );
}
