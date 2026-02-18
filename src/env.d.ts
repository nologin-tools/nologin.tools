/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;

type Env = {
  DB: D1Database;
  SITE_URL: string;
  ADMIN_SECRET: string;
  GITHUB_TOKEN: string;
  ARCHIVE_ORG_ACCESS_KEY: string;
  ARCHIVE_ORG_SECRET_KEY: string;
};

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
