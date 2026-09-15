export const prerender = false;

import type { APIRoute } from 'astro';
import { ImageResponse } from '@cf-wasm/og/workerd';
import { getDb } from '../../../../db';
import { tools, badgeDisplays } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { getToolBySlug } from '../../../../data/loader';

export const GET: APIRoute = async (ctx) => {
  const rawSlug = ctx.params.slug || '';
  const slug = rawSlug.replace(/\.png$/, '');

  let tool: {
    name: string;
    url: string;
    description: string | null;
    coreTask: string | null;
    status: string;
  } | null = null;
  let isBadgeActive = false;

  // 1. Database lookup
  if (ctx.locals.runtime?.env?.DB) {
    try {
      const db = getDb(ctx.locals.runtime.env.DB);
      const [dbTool] = await db
        .select({
          id: tools.id,
          name: tools.name,
          url: tools.url,
          description: tools.description,
          coreTask: tools.coreTask,
          status: tools.status,
        })
        .from(tools)
        .where(eq(tools.slug, slug))
        .limit(1);

      if (dbTool) {
        tool = dbTool;
        const [badgeRow] = await db
          .select({ displayType: badgeDisplays.displayType })
          .from(badgeDisplays)
          .where(eq(badgeDisplays.toolId, dbTool.id))
          .limit(1);
        if (badgeRow?.displayType === 'explicit') {
          isBadgeActive = true;
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. Static snapshot fallback
  if (!tool) {
    const staticTool = getToolBySlug(slug);
    if (staticTool) {
      tool = {
        name: staticTool.name,
        url: staticTool.url,
        description: staticTool.description,
        coreTask: staticTool.coreTask,
        status: staticTool.status,
      };
      if (staticTool.badgeDisplayType === 'explicit') {
        isBadgeActive = true;
      }
    }
  }

  if (!tool) {
    return new Response('Not found', { status: 404 });
  }

  const isVerified = tool.status === 'approved';
  let hostname = '';
  try {
    hostname = new URL(tool.url).hostname.replace(/^www\./, '');
  } catch {
    hostname = tool.url;
  }

  const taskText = tool.coreTask || tool.description || 'Frictionless privacy-friendly online access';
  const displayTask = taskText.length > 130 ? taskText.slice(0, 127) + '...' : taskText;

  const fontData = await fetch(
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf'
  ).then((res) => res.arrayBuffer());

  const fontBoldData = await fetch(
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuBWYMZhrib2Bg-4.ttf'
  ).then((res) => res.arrayBuffer());

  const statusLabel = isBadgeActive
    ? '★ LEVEL 3 VERIFIED ACTIVE'
    : isVerified
      ? '✓ NO-LOGIN VERIFIED'
      : '⏳ VERIFICATION PENDING';

  const statusBg = isVerified ? '#f0fdf4' : '#fefce8';
  const statusBorder = isVerified ? '#86efac' : '#fde047';
  const statusColor = isVerified ? '#16a34a' : '#a16207';

  const response = await ImageResponse.async(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
          padding: '28px',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
                border: '3px solid #16a34a',
                borderRadius: '20px',
                padding: '40px 48px',
              },
              children: [
                // Top header
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #e2e8f0',
                      paddingBottom: '20px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          },
                          children: [
                            {
                              type: 'span',
                              props: {
                                style: {
                                  fontSize: '22px',
                                  fontWeight: 900,
                                  color: '#16a34a',
                                  letterSpacing: '-0.02em',
                                },
                                children: '🛡️ NoLoginTools.org',
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: {
                                  fontSize: '11px',
                                  fontWeight: 900,
                                  color: '#64748b',
                                  letterSpacing: '0.12em',
                                  textTransform: 'uppercase' as const,
                                },
                                children: 'Digital Trust Certificate · NLW-STD-001 v1.2',
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
                            padding: '6px 16px',
                            backgroundColor: statusBg,
                            border: `1.5px solid ${statusBorder}`,
                            borderRadius: '9999px',
                          },
                          children: [
                            {
                              type: 'span',
                              props: {
                                style: {
                                  fontSize: '13px',
                                  fontWeight: 900,
                                  color: statusColor,
                                  letterSpacing: '0.04em',
                                },
                                children: statusLabel,
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                // Middle: Awarded Tool & Certified Task
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      margin: '12px 0',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '18px',
                          },
                          children: [
                            {
                              type: 'img',
                              props: {
                                src: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
                                width: 56,
                                height: 56,
                                style: {
                                  borderRadius: '14px',
                                  border: '2px solid #e2e8f0',
                                },
                              },
                            },
                            {
                              type: 'div',
                              props: {
                                style: {
                                  display: 'flex',
                                  flexDirection: 'column',
                                },
                                children: [
                                  {
                                    type: 'span',
                                    props: {
                                      style: {
                                        fontSize: '44px',
                                        fontWeight: 900,
                                        color: '#0f172a',
                                        letterSpacing: '-0.03em',
                                        lineHeight: 1.1,
                                      },
                                      children: tool.name,
                                    },
                                  },
                                  {
                                    type: 'span',
                                    props: {
                                      style: {
                                        fontSize: '18px',
                                        color: '#64748b',
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
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#f8fafc',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            gap: '4px',
                          },
                          children: [
                            {
                              type: 'span',
                              props: {
                                style: {
                                  fontSize: '11px',
                                  fontWeight: 900,
                                  color: '#059669',
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase' as const,
                                },
                                children: 'Certified Core Task (Zero Signup Required)',
                              },
                            },
                            {
                              type: 'p',
                              props: {
                                style: {
                                  fontSize: '20px',
                                  fontWeight: 500,
                                  color: '#1e293b',
                                  lineHeight: 1.4,
                                  margin: 0,
                                },
                                children: displayTask,
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                // Three trust pillars
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            flex: 1,
                            padding: '10px 14px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          },
                          children: [
                            {
                              type: 'span',
                              props: {
                                style: { fontSize: '13px', fontWeight: 900, color: '#16a34a' },
                                children: '✓',
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: { fontSize: '13px', fontWeight: 600, color: '#334155' },
                                children: 'Zero Accounts',
                              },
                            },
                          ],
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            flex: 1,
                            padding: '10px 14px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          },
                          children: [
                            {
                              type: 'span',
                              props: {
                                style: { fontSize: '13px', fontWeight: 900, color: '#16a34a' },
                                children: '✓',
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: { fontSize: '13px', fontWeight: 600, color: '#334155' },
                                children: 'Privacy First',
                              },
                            },
                          ],
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            flex: 1,
                            padding: '10px 14px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          },
                          children: [
                            {
                              type: 'span',
                              props: {
                                style: { fontSize: '13px', fontWeight: 900, color: '#16a34a' },
                                children: '✓',
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: { fontSize: '13px', fontWeight: 600, color: '#334155' },
                                children: 'Continuous Health Checks',
                              },
                            },
                          ],
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
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '16px',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '12px',
                            color: '#94a3b8',
                          },
                          children: 'Issuer: NoLoginTools.org Verification Authority',
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '13px',
                            fontWeight: 900,
                            color: '#16a34a',
                          },
                          children: `nologin.tools/badge/${slug}`,
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
  headers.set('Cache-Control', 'public, max-age=21600');

  return new Response(response.body, {
    status: response.status,
    headers,
  });
};
