export const prerender = false;

import type { APIRoute } from 'astro';
import { ImageResponse } from '@cf-wasm/og/workerd';
import { getAlternativeBySlug } from '../../../../lib/alternatives-data.mjs';

export const GET: APIRoute = async (ctx) => {
  const { slug } = ctx.params;
  const target = getAlternativeBySlug(slug!);

  if (!target) {
    return new Response('Not found', { status: 404 });
  }

  const [fontData, fontBoldData] = await Promise.all([
    fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf'
    ).then((res) => res.arrayBuffer()),
    fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuBWYMZhrib2Bg-4.ttf'
    ).then((res) => res.arrayBuffer()),
  ]);

  const headline = target.headline
    ? target.headline.length > 110
      ? target.headline.slice(0, 107) + '...'
      : target.headline
    : `Privacy-friendly, zero-login alternatives to ${target.name}.`;

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
          padding: '50px 70px',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter',
        },
        children: [
          // Header
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '12px' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            width: '36px',
                            height: '36px',
                            backgroundColor: '#16a34a',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '20px',
                            fontWeight: 900,
                          },
                          children: 'n',
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: '22px', fontWeight: 900, color: '#0a0a0a' },
                          children: 'nologin.tools',
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 14px',
                      backgroundColor: '#fef2f2',
                      borderRadius: '8px',
                      border: '1px solid #fecaca',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#b91c1c',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase' as const,
                    },
                    children: `ALTERNATIVES · ${target.category}`,
                  },
                },
              ],
            },
          },

          // Center: Title + headline
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
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#737373',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                    },
                    children: 'Curated SaaS Alternatives',
                  },
                },
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontSize: '48px',
                      fontWeight: 900,
                      color: '#0a0a0a',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.1,
                      margin: 0,
                    },
                    children: `Best No-Login ${target.name} Alternatives`,
                  },
                },
                {
                  type: 'p',
                  props: {
                    style: {
                      fontSize: '22px',
                      color: '#525252',
                      lineHeight: 1.45,
                      margin: 0,
                    },
                    children: headline,
                  },
                },
              ],
            },
          },

          // Footer
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '20px',
                borderTop: '1px solid #e5e5e5',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#16a34a',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase' as const,
                    },
                    children: '✓ No Account Required · Client-Side Execution · Verified Free',
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '14px',
                      color: '#737373',
                    },
                    children: target.primaryUtility,
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

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'public, max-age=86400');

  return new Response(response.body, {
    status: response.status,
    headers,
  });
};
