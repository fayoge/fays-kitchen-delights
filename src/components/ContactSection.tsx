import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const CONTACT_EMAIL = "Info@fayskitchen.com";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty({ message: "Please tell us your name" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  subject: z
    .string()
    .trim()
    .max(150, { message: "Subject must be less than 150 characters" }),
  message: z
    .string()
    .trim()
    .nonempty({ message: "Please write a short message" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

export function ContactSection() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = contactSchema.safeParse({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      subject: String(form.get("subject") ?? ""),
      message: String(form.get("message") ?? ""),
    });

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    const { name, email, subject, message } = parsed.data;
    const mailSubject = subject || `Hello from ${name}`;
    const body = `${message}\n\n—\n${name}\n${email}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      mailSubject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <section id="contact" className="scroll-mt-20 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="eyebrow text-primary">Contact us</p>
          <h2 className="mt-3 text-4xl">Say hi, send feedback, ask anything</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Questions about heat levels, a bulk order, or just want to tell Fay how the
            pikliz turned out on your plate? We read every message.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            <Mail className="size-4 text-primary" />
            {CONTACT_EMAIL}
          </a>
        </div>

        <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-border bg-card p-6 shadow-lift">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input id="contact-name" name="name" maxLength={100} placeholder="Your name" />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                maxLength={255}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="contact-subject">Subject (optional)</Label>
            <Input
              id="contact-subject"
              name="subject"
              maxLength={150}
              placeholder="Just saying hi"
            />
            {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
          </div>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              name="message"
              rows={5}
              maxLength={1000}
              placeholder="Tell us what's on your mind…"
            />
            {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
            <Send className="size-4" /> Send message
          </Button>
          {sent && (
            <p className="mt-3 text-sm text-muted-foreground">
              Your email app should be opening with the message ready to send. If it
              doesn&apos;t, write us at {CONTACT_EMAIL}.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
