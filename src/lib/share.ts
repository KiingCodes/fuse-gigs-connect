// Generate share URLs that always point to the real Fuse Gigs app
// (production domain) rather than the lovable preview/sandbox.

const PRODUCTION_HOSTS = ["fusegigs.com", "www.fusegigs.com", "fusegigs.app"];

const isPreviewHost = (host: string) =>
  host.includes("lovableproject.com") ||
  host.includes("lovable.app") ||
  host.includes("localhost") ||
  host.includes("127.0.0.1");

export const getShareOrigin = (): string => {
  if (typeof window === "undefined") return "https://fusegigs.com";
  const { origin, hostname } = window.location;
  // If we're on a real custom domain, use it
  if (!isPreviewHost(hostname)) return origin;
  // Otherwise fall back to canonical production host
  return "https://fusegigs.com";
};

export const buildShareUrl = (path: string): string => {
  const base = getShareOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

export const shareLink = async (opts: {
  url: string;
  title?: string;
  text?: string;
  toastSuccess?: (msg: string) => void;
  toastError?: (msg: string) => void;
}) => {
  const { url, title, text, toastSuccess, toastError } = opts;
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toastSuccess?.("Link copied!");
  } catch {
    try {
      await navigator.clipboard.writeText(url);
      toastSuccess?.("Link copied!");
    } catch {
      toastError?.("Could not share. Please copy the URL manually.");
    }
  }
};
