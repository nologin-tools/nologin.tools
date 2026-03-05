export const prerender = false;

import type { APIRoute } from 'astro';
import { ImageResponse } from '@cf-wasm/og/workerd';
import { getDb } from '../../../db';
import { tools } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async (ctx) => {
  const { slug } = ctx.params;
  const db = getDb(ctx.locals.runtime.env.DB);

  const [tool] = await db
    .select({
      name: tools.name,
      description: tools.description,
      status: tools.status,
      url: tools.url,
    })
    .from(tools)
    .where(eq(tools.slug, slug!))
    .limit(1);

  if (!tool) {
    return new Response('Not found', { status: 404 });
  }

  const isVerified = tool.status === 'approved';
  const hostname = new URL(tool.url).hostname;
  const desc = tool.description
    ? tool.description.length > 120
      ? tool.description.slice(0, 117) + '...'
      : tool.description
    : '';

  const fontData = await fetch(
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf'
  ).then((res) => res.arrayBuffer());

  const fontBoldData = await fetch(
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuBWYMZhrib2Bg-4.ttf'
  ).then((res) => res.arrayBuffer());

  const response = await ImageResponse.async(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter',
        },
        children: [
          // Top: brand
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#16a34a',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 900,
                    },
                    children: 'n',
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '24px',
                      fontWeight: 900,
                      color: '#0a0a0a',
                      letterSpacing: '-0.02em',
                    },
                    children: 'nologin.tools',
                  },
                },
              ],
            },
          },
          // Middle: tool info
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                    },
                    children: [
                      {
                        type: 'img',
                        props: {
                          src: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
                          width: 64,
                          height: 64,
                          style: {
                            borderRadius: '16px',
                            border: '2px solid #e5e5e5',
                          },
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '52px',
                            fontWeight: 900,
                            color: '#0a0a0a',
                            letterSpacing: '-0.03em',
                            lineHeight: 1.1,
                          },
                          children: tool.name,
                        },
                      },
                    ],
                  },
                },
                ...(desc
                  ? [
                      {
                        type: 'p',
                        props: {
                          style: {
                            fontSize: '24px',
                            color: '#737373',
                            lineHeight: 1.5,
                            margin: 0,
                          },
                          children: desc,
                        },
                      },
                    ]
                  : []),
              ],
            },
          },
          // Bottom: badge
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              },
              children: isVerified
                ? [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 20px',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '12px',
                          border: '2px solid #bbf7d0',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '20px',
                                fontWeight: 900,
                                color: '#16a34a',
                                textTransform: 'uppercase' as const,
                                letterSpacing: '0.05em',
                              },
                              children: 'NoLogin Verified',
                            },
                          },
                        ],
                      },
                    },
                  ]
                : [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '18px',
                          color: '#a3a3a3',
                        },
                        children: hostname,
                      },
                    },
                  ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 400,
          style: 'normal' as const,
        },
        {
          name: 'Inter',
          data: fontBoldData,
          weight: 900,
          style: 'normal' as const,
        },
      ],
    }
  );

  // Add cache header (ImageResponse doesn't set it)
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'public, max-age=21600');

  return new Response(response.body, {
    status: response.status,
    headers,
  });
};
