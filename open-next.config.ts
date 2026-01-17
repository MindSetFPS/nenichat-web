import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";


// https://opennext.js.org/cloudflare/caching
// SSG site
// If your site is static, you do not need a Queue nor a Tag Cache. You can use a read-only Workers Static Assets-based incremental cache for the prerendered routes.

export default defineCloudflareConfig({
    incrementalCache: staticAssetsIncrementalCache,
    enableCacheInterception: true,
});