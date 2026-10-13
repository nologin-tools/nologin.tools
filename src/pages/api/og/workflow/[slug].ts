export const prerender = false;

import type { APIRoute } from 'astro';
import { ImageResponse } from '@cf-wasm/og/workerd';
import { getWorkflowBySlug } from '../../../../lib/workflows-data.mjs';

export const GET: APIRoute = async (ctx) => {
  const { slug } = ctx.params;
  const recipe = getWorkflowBySlug(slug!);

  if (!recipe) {
    return new Response('Not found', { status: 404 });
  }

  const stepsPreview = recipe.steps
    .map((s) => s.actionTitle)
    .slice(0, 4)
    .join('  ➔  ');

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
                      backgroundColor: '#eff6ff',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1d4ed8',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase' as const,
                    },
                    children: `WORKFLOW RECIPE · ${recipe.timeEstimate}`,
                  },
                },
              ],
            },
          },

          // Center: Title + Pipeline steps
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              },
              children: [
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontSize: '44px',
                      fontWeight: 900,
                      color: '#0a0a0a',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.15,
                      margin: 0,
                    },
                    children: recipe.title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 24px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#334155',
                    },
                    children: stepsPreview,
                  },
                },
              ],
            },
          },

          // Footer: privacy guarantee
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
                    children: '✓ 100% In-Browser · Zero Registration · Private Data Flow',
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '14px',
                      color: '#737373',
                    },
                    children: `${recipe.steps.length} Steps Pipeline`,
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
