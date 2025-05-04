import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    // Only protect routes under /app or /profile
    if ((request.nextUrl.pathname.startsWith("/app") || 
         request.nextUrl.pathname.startsWith("/profile")) && 
        !user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Redirect unauthenticated users from auth pages to home if they're already logged in
    if ((request.nextUrl.pathname.startsWith("/sign-in") || 
         request.nextUrl.pathname.startsWith("/sign-up")) && 
        user) {
      return NextResponse.redirect(new URL("/app", request.url));
    }

    return response;
};
