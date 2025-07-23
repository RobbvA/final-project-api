import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "", // vul hier je DSN in, of laat leeg
  tracesSampleRate: 1.0, // Optioneel: performance tracing, kan je later aanpassen
});

export default Sentry;
