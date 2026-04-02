import Script from "next/script";

import { getGoogleAnalyticsMeasurementId } from "@/lib/togstrek-google-analytics";

/** GA4 (`gtag.js`) — only renders when {@link getGoogleAnalyticsMeasurementId} returns an id. */
export function TogstrekGoogleAnalytics() {
  const id = getGoogleAnalyticsMeasurementId();
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="togstrek-google-analytics" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');
        `.trim()}
      </Script>
    </>
  );
}
