import { permanentRedirect } from "next/navigation";

/**
 * Legacy blog URL → canonical Istanbul place page (`/europe/turkiye/istanbul`).
 */
export default function BlogGalataTowerRedirectPage() {
  permanentRedirect("/europe/turkiye/istanbul");
}
