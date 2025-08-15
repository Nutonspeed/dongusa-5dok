# Client/Server Boundary Rules

- Client components must not import server-only libraries or service-role utilities.
- Server components and API routes may call service layer functions directly.
- Client code that needs data should call an API route; do not expose service-role keys to the browser.
- All client components that use React hooks must include the `"use client"` directive at the top.
