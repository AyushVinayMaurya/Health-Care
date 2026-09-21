

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://3d627de24f5d06a1fc39000a06ca9a94@o4506813739368448.ingest.us.sentry.io/4507458386526208",

 
  tracesSampleRate: 1,

  debug: false,

  replaysOnErrorSampleRate: 1.0,

 
  replaysSessionSampleRate: 0.1,

  
  integrations: [
    Sentry.replayIntegration({
      
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
