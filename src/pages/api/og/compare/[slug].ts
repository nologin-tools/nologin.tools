export const prerender = false;

import type { APIRoute } from 'astro';
import { ImageResponse } from '@cf-wasm/og/workerd';
import { getComparisonBySlug } from '../../../../lib/comparisons-data.mjs';
import { getToolBySlug } from '../../../../data/loader';

export const GET: APIRoute = async (ctx) => {
  const { slug } = ctx.params;
  const pair = getComparisonBySlug(slug!);

  if (!pair) {
    return new Response('Not found', { status: 404 });
  }

  const toolA = getToolBySlug(pair.toolASlug);
  const toolB = getToolBySlug(pair.toolBSlug);

  const nameA = toolA?.name || pair.toolASlug;
  const nameB = toolB?.name || pair.toolBSlug;
  const hostA = toolA?.url ? new URL(toolA.url).hostname : '';
  const hostB = toolB?.url ? new URL(toolB.url).hostname : '';

  const headline = pair.headline
    ? pair.headline.length > 105
      ? pair.headline.slice(0, 102) + '...'
      : pair.headline
    : `${nameA} vs ${nameB}`;

  const [fontData, fontBoldData] = await Promise.all([
    fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf'
    ).then((res) => res.arrayBuffer()),
    fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuBWYMZhrib2Bg-4.ttf'
    ).then((res) => res.arrayBuffer()),
  ]);

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
          // Header: brand + badge
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
                      padding: '6px 14px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px',
                      border: '1px solid #e5e5e5',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#525252',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase' as const,
                    },
                    children: `HEAD-TO-HEAD · ${pair.category}`,
                  },
                },
              ],
            },
          },

          // Center: Versus Block
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '24px',
                padding: '30px 40px',
                backgroundColor: '#fafafa',
                borderRadius: '16px',
                border: '2px solid #e5e5e5',
              },
              children: [
                // Tool A
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '16px', flex: 1 },
                    children: [
                      ...(hostA ? [{
                        type: 'img',
                        props: {
                          src: `https://www.google.com/s2/favicons?domain=${hostA}&sz=128`,
                          width: 52,
                          height: 52,
                          style: { borderRadius: '12px', border: '1px solid #e5e5e5' },
                        },
                      }] : []),
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '38px',
                            fontWeight: 900,
                            color: '#0a0a0a',
                            letterSpacing: '-0.02em',
                          },
                          children: nameA,
                        },
                      },
                    ],
                  },
                },

                // VS Pill
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '64px',
                      height: '64px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '50%',
                      border: '2px solid #f59e0b',
                      color: '#b45309',
                      fontSize: '22px',
                      fontWeight: 900,
                    },
                    children: 'VS',
                  },
                },

                // Tool B
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', flex: 1 },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '38px',
                            fontWeight: 900,
                            color: '#0a0a0a',
                            letterSpacing: '-0.02em',
                          },
                          children: nameB,
                        },
                      },
                      ...(hostB ? [{
                        type: 'img',
                        props: {
                          src: `https://www.google.com/s2/favicons?domain=${hostB}&sz=128`,
                          width: 52,
                          height: 52,
                          style: { borderRadius: '12px', border: '1px solid #e5e5e5' },
                        },
                      }] : []),
                    ],
                  },
                },
              ],
            },
          },

          // Headline & Footer
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              },
              children: [
                {
                  type: 'p',
                  props: {
                    style: {
                      fontSize: '20px',
                      color: '#525252',
                      lineHeight: 1.4,
                      margin: 0,
                    },
                    children: headline,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#16a34a',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase' as const,
                          },
                          children: '✓ No Account Required · 100% Free & In-Browser',
                        },
                      },
                    ],
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
