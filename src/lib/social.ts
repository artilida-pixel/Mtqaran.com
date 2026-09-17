// The foundation's social accounts, in one place: the footer and the block at
// the bottom of the homepage both read this list. An entry with an empty
// `href` is simply not rendered, so filling one in here is all it takes to
// make that icon appear across the site.
export type SocialNetwork = "telegram" | "instagram" | "youtube" | "facebook";

export const socialLinks: { network: SocialNetwork; label: string; href: string }[] = [
  { network: "telegram", label: "Telegram", href: "" },
  { network: "instagram", label: "Instagram", href: "" },
  {
    network: "youtube",
    label: "YouTube",
    // The MTQARAN Academy playlist every lecture on the site comes from.
    // Replace with the channel URL once there is one.
    href: "https://www.youtube.com/playlist?list=PLY7A0f5wC8fhag7Wu7Srnhty4Is7v2Zf7",
  },
  { network: "facebook", label: "Facebook", href: "" },
];

export const activeSocialLinks = socialLinks.filter((l) => l.href.trim() !== "");
