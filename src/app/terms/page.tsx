import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service · Skillora",
  description: "The rules for using Skillora and Archimedes.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="These terms cover your use of Skillora, including Archimedes, our AI learning guide. By creating an account or using Skillora, you agree to them. If you don't agree, please don't use the service."
    >
      <section>
        <h2>Your account</h2>
        <ul>
          <li>You must be at least 13 years old, and old enough in your country to agree to these terms.</li>
          <li>Give accurate sign-up details and keep your password to yourself. An account is for one person.</li>
          <li>You&rsquo;re responsible for what happens under your account.</li>
        </ul>
      </section>

      <section>
        <h2>Learning safely</h2>
        <p>
          Skillora&rsquo;s plans, tips and Archimedes&rsquo; answers are general learning guidance, not professional advice.
          AI responses can be wrong or incomplete, so use your judgement. Some skills involve sharp tools, heat or physical
          effort: follow safety instructions for your equipment, and stop if something feels unsafe. You practise at your
          own risk.
        </p>
      </section>

      <section>
        <h2>Fair use</h2>
        <p>Please don&rsquo;t:</p>
        <ul>
          <li>break the law, or upload content that is illegal, hateful, sexual, or that you don&rsquo;t have rights to;</li>
          <li>try to access other people&rsquo;s data, or probe, overload or disrupt the service;</li>
          <li>scrape Skillora, or use automated tools to call Archimedes;</li>
          <li>get around the daily AI limit, for example with multiple accounts;</li>
          <li>use Archimedes to produce harmful or misleading content.</li>
        </ul>
        <p>
          Signed-in learners get a daily allowance of AI requests, which resets each day. We may change the allowance to
          keep the service running.
        </p>
      </section>

      <section>
        <h2>Your content</h2>
        <p>
          Notes, photos, plan edits and chats you create remain yours. You give us permission to store and process them
          only as needed to run Skillora for you, including sending chat content to our AI provider. Delete them, or your
          whole account, at any time in{" "}
          <Link href="/settings" className="font-semibold text-ink underline underline-offset-2">
            Settings
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>Certificates</h2>
        <p>
          A Skillora certificate shows that you finished a skill&rsquo;s steps and passed its short assessment on Skillora.
          It isn&rsquo;t an accredited qualification or a professional licence. Don&rsquo;t present it as one.
        </p>
      </section>

      <section>
        <h2>Other sites</h2>
        <p>
          Learning resources link to other websites and videos. We don&rsquo;t control them and aren&rsquo;t responsible for
          their content or availability.
        </p>
      </section>

      <section>
        <h2>The service</h2>
        <p>
          Skillora is provided &ldquo;as is&rdquo;. We work to keep it available and accurate, but we can&rsquo;t promise it
          will always be uninterrupted or error-free, and we may change, add or remove features. To the extent the law
          allows, we aren&rsquo;t liable for indirect or consequential losses, or for lost data, arising from your use of
          Skillora.
        </p>
      </section>

      <section>
        <h2>Ending your use</h2>
        <p>
          You can stop using Skillora and delete your account whenever you like. We may suspend or close accounts that
          break these terms or put the service or other learners at risk.
        </p>
      </section>

      <section>
        <h2>Changes, law and contact</h2>
        <p>
          We may update these terms. We&rsquo;ll change the date at the top, and tell you in the app for significant
          changes. Continuing to use Skillora after a change means you accept it. These terms are governed by the laws of
          the Republic of the Philippines. Our{" "}
          <Link href="/privacy" className="font-semibold text-ink underline underline-offset-2">
            Privacy Policy
          </Link>{" "}
          explains how we handle your data.
        </p>
        <ContactLine topic="questions about these terms" />
      </section>
    </LegalPage>
  );
}
