/** Page-specific copy, lifted out so the page reads as composition rather than content. */
export const PRACTICES = [
  {
    icon: "shield",
    title: "Encrypted everywhere",
    body: "TLS in transit, AES-256 at rest, and no plaintext copies in logs or exports.",
  },
  {
    icon: "layers",
    title: "Tenant isolation",
    body: "Every workstream is scoped to your organisation at the query layer, not the UI.",
  },
  {
    icon: "bolt",
    title: "Revocable share links",
    body: "A read-only link can be expired at any time, and every open is recorded.",
  },
  {
    icon: "chart",
    title: "Audited access",
    body: "Every read and write carries who, what, and when — exportable on request.",
  },
] as const;

export const SECURITY_FAQS = [
  {
    question: "Where is our data stored?",
    answer:
      "In a single region you choose at signup. Backups stay in the same region and are encrypted with a separate key.",
  },
  {
    question: "Do you support single sign-on?",
    answer: "Yes, on the Fleet plan — SAML and OIDC, with enforced session lifetimes.",
  },
  {
    question: "Can we get a copy of your latest assessment?",
    answer:
      "Yes. Contact support and we will share the current third-party penetration test summary under NDA.",
  },
] as const;
