import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CertificateDocument } from "@/components/assessment/CertificateDocument";
import { buttonClasses } from "@/components/ui/Button";
import { getCategoryStyleById } from "@/lib/skill-progress";
import { getPublicCertificate } from "@/lib/public-certificate";

// Always read live: turning sharing off must take effect immediately.
export const dynamic = "force-dynamic";

type Props = { params: { token: string } };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cert = await getPublicCertificate(params.token);
  if (!cert) return { title: "Certificate not found · Skillora", robots: { index: false } };
  const title = `${cert.name} — ${cert.skill.title}`;
  const description = `Certificate of mastery earned on Skillora on ${formatDate(cert.certifiedAt)}.`;
  return {
    title: `${title} · Skillora`,
    description,
    // Shared by link only; keep it out of search results.
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** A learner's shared certificate. Only exists while they keep sharing on. */
export default async function PublicCertificatePage({ params }: Props) {
  const cert = await getPublicCertificate(params.token);
  if (!cert) notFound();

  const category = getCategoryStyleById(cert.skill.category_id);

  return (
    <main id="main" className="flex-1 bg-canvas text-ink">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <p className="mb-4 flex items-center justify-center gap-1.5 text-sm text-success font-semibold">
          <span aria-hidden="true">✓</span> Verified by Skillora · {cert.credentialId}
        </p>
        <CertificateDocument
          credentialId={cert.credentialId}
          skill={cert.skill}
          category={category}
          userName={cert.name}
          honorific={`Certified in ${cert.skill.title}`}
          issuedOn={formatDate(cert.certifiedAt)}
        />
        <div className="mt-10 text-center">
          <p className="text-[15px] text-ink-muted">
            {cert.name.split(" ")[0]} finished every step of this skill and passed its assessment.
          </p>
          <Link href="/" className={buttonClasses({ className: "mt-5" })}>
            Learn a skill on Skillora
          </Link>
        </div>
      </div>
    </main>
  );
}
