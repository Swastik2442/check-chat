import env from "@/env";

export function getConvexSiteUrl() {
  let convexSiteUrl;
  if (env.NEXT_PUBLIC_CONVEX_URL.includes(".cloud")) {
    convexSiteUrl = env.NEXT_PUBLIC_CONVEX_URL.replace(
      /\.cloud$/,
      ".site"
    );
  } else {
    const url = new URL(env.NEXT_PUBLIC_CONVEX_URL);
    url.port = String(Number(url.port) + 1);
    convexSiteUrl = url.toString();
  }
  return convexSiteUrl;
}
