import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy · Skillora",
  description: "What Skillora collects, why, who processes it, and how to delete it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="Skillora helps you learn practical skills in short, ordered steps. This page explains what we keep about you, why, who helps us run the service, and how to delete it. We don't sell your data and we don't show ads."
    >
      <section>
        <h2>Using Skillora without an account</h2>
        <p>
          As a guest, everything you do (the skills you add, steps you finish, notes and chats) is saved only in your
          browser&rsquo;s local storage. It never reaches our servers, except that guests can&rsquo;t use Archimedes&rsquo;
          AI features. Clearing your browser&rsquo;s site data removes it.
        </p>
      </section>

      <section>
        <h2>What we collect when you have an account</h2>
        <ul>
          <li>
            <strong>Account details:</strong> your email address, the name you sign up with, and your password, which is
            stored only as a secure hash by our sign-in provider.
          </li>
          <li>
            <strong>Learning activity:</strong> the skills in your Studio, steps you complete and when, practice days,
            step notes, edits to your plans, your ratings of learning links, refresher progress and your chosen
            interest.
          </li>
          <li>
            <strong>Conversations with Archimedes:</strong> your chats, plus short notes Archimedes keeps about your
            goals and available time so its suggestions fit you.
          </li>
          <li>
            <strong>Assessments and certificates:</strong> the skills you&rsquo;re certified in and when.
          </li>
          <li>
            <strong>Before &amp; after photos</strong> you choose to upload. They&rsquo;re stored privately and shown only
            to you.
          </li>
          <li>
            <strong>Email preferences</strong> for reminders and weekly recaps, if you turn them on.
          </li>
          <li>
            <strong>Usage counts:</strong> how many AI requests you make each day, to enforce a fair daily limit.
          </li>
        </ul>
        <p>
          Your browser also stores your sign-in session and display preferences (theme, sound, layout). Our hosting
          provider keeps standard server logs, such as IP address and browser type, for security and troubleshooting.
          We don&rsquo;t use analytics or advertising trackers.
        </p>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To run Skillora: save your progress, sync it across devices and show your Studio.</li>
          <li>To generate Archimedes&rsquo; replies, plans, practice help, assessments and voice.</li>
          <li>To send the emails you&rsquo;ve opted into. Every email has a one-click unsubscribe link.</li>
          <li>To keep the service safe and affordable, for example with daily AI limits.</li>
        </ul>
      </section>

      <section>
        <h2>AI features</h2>
        <p>
          When you use Archimedes, what you type, the skill and step you&rsquo;re working on, and any voice recording
          you make for pronunciation practice are sent to OpenAI to produce a response. OpenAI processes this under its
          API terms. We don&rsquo;t keep your voice recordings. Please don&rsquo;t share sensitive personal information in
          chats.
        </p>
      </section>

      <section>
        <h2>Who processes your data</h2>
        <p>We use a small number of providers to run Skillora:</p>
        <ul>
          <li>
            <strong>Supabase</strong>: sign-in, database and private photo storage.
          </li>
          <li>
            <strong>Vercel</strong>: hosting the website.
          </li>
          <li>
            <strong>OpenAI</strong>: Archimedes&rsquo; AI features.
          </li>
          <li>
            <strong>Resend</strong>: sending reminder and recap emails.
          </li>
        </ul>
        <p>
          Learning resources link to other sites, such as YouTube, which have their own privacy policies. Their data may
          be stored in countries other than yours.
        </p>
      </section>

      <section>
        <h2>Shared certificates</h2>
        <p>
          Certificates are private unless you switch on sharing. A shared certificate is visible to anyone with its link
          and shows your name, the skill and the date. Search engines are asked not to index it. Switching sharing off
          takes the page down straight away.
        </p>
      </section>

      <section>
        <h2>How long we keep it, and deleting it</h2>
        <p>
          We keep your data while your account exists. You can delete your account at any time in{" "}
          <Link href="/settings" className="font-semibold text-ink underline underline-offset-2">
            Settings
          </Link>
          . That permanently removes your account and everything linked to it, including your photos. Copies in our
          providers&rsquo; backups expire on their normal schedule.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          Depending on where you live, for example under the Philippine Data Privacy Act of 2012 or the GDPR, you may
          have the right to access, correct, export or delete your personal data, and to object to how it&rsquo;s used.
          You can delete everything yourself in Settings. For anything else, contact us using the details below.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>Skillora isn&rsquo;t intended for children under 13, and we don&rsquo;t knowingly collect their data.</p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          Data is sent over HTTPS. Each account can only read its own records, and photos sit in private storage that
          is opened only with short-lived links. No system is perfectly secure, so please use a strong, unique password.
        </p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          If we change this policy, we&rsquo;ll update the date at the top, and tell you in the app for significant
          changes.
        </p>
        <ContactLine topic="privacy questions or requests" />
      </section>
    </LegalPage>
  );
}
