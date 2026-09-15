/**
 * NoLogin Switcher Web Widget
 * Lightweight (<4KB), zero-dependency, Shadow DOM isolated embeddable widget.
 *
 * Usage:
 *   <div class="nologin-widget" data-category="Design" data-theme="dark" data-max="3"></div>
 *   <script src="https://nologin.tools/widget.js" async></script>
 *
 * Self-mounting:
 *   <script src="https://nologin.tools/widget.js" data-category="Design" data-theme="dark" data-max="3" async></script>
 */
(function () {
  'use strict';

  function esc(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getOrigin(el) {
    if (el && el.src) {
      try {
        return new URL(el.src).origin;
      } catch (_) {}
    }
    return 'https://nologin.tools';
  }

  var CSS =
    ':host{display:block;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.4;margin:14px 0}' +
    '*{box-sizing:border-box;margin:0;padding:0}' +
    '.nl-card{background:var(--bg,#fff);color:var(--text,#171717);border:2px solid var(--bdr,#e5e5e5);border-radius:14px;padding:14px;box-shadow:0 4px 12px rgba(0,0,0,.05);max-width:100%}' +
    '.nl-dark{--bg:#171717;--text:#f5f5f5;--muted:#a3a3a3;--bdr:#2e2e2e;--ibg:#222;--ibdr:#333;--bbg:#132d1e;--bfg:#34d399;--btn-bg:#f5f5f5;--btn-fg:#171717}' +
    '.nl-light{--bg:#fff;--text:#171717;--muted:#737373;--bdr:#e5e5e5;--ibg:#fafafa;--ibdr:#ebebeb;--bbg:#ecfdf5;--bfg:#059669;--btn-bg:#171717;--btn-fg:#fff}' +
    '@media(prefers-color-scheme:dark){.nl-auto{--bg:#171717;--text:#f5f5f5;--muted:#a3a3a3;--bdr:#2e2e2e;--ibg:#222;--ibdr:#333;--bbg:#132d1e;--bfg:#34d399;--btn-bg:#f5f5f5;--btn-fg:#171717}}' +
    '@media(prefers-color-scheme:light){.nl-auto{--bg:#fff;--text:#171717;--muted:#737373;--bdr:#e5e5e5;--ibg:#fafafa;--ibdr:#ebebeb;--bbg:#ecfdf5;--bfg:#059669;--btn-bg:#171717;--btn-fg:#fff}}' +
    '.nl-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--bdr,#e5e5e5);gap:8px}' +
    '.nl-title{font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px}' +
    '.nl-pill{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 7px;border-radius:999px;background:var(--bbg,#ecfdf5);color:var(--bfg,#059669);display:inline-flex;align-items:center;gap:4px;white-space:nowrap}' +
    '.nl-pill::before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:currentColor}' +
    '.nl-list{display:flex;flex-direction:column;gap:8px;margin-bottom:10px}' +
    '.nl-item{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--ibg,#fafafa);border:1px solid var(--ibdr,#ebebeb);border-radius:10px;padding:8px 12px;color:inherit;text-decoration:none;transition:transform .12s ease}' +
    '.nl-item:hover{transform:translateY(-1px);border-color:var(--bdr,#d1d5db)}' +
    '.nl-info{display:flex;align-items:center;gap:10px;min-width:0;flex:1}' +
    '.nl-fav{width:18px;height:18px;border-radius:4px;flex-shrink:0;background:#fff}' +
    '.nl-txt{min-width:0;flex:1}' +
    '.nl-name{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:5px}' +
    '.nl-tag{font-size:9px;font-weight:600;padding:1px 4px;border-radius:3px;background:rgba(16,185,129,.15);color:var(--bfg,#059669)}' +
    '.nl-desc{font-size:11px;color:var(--muted,#737373);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}' +
    '.nl-btn{background:var(--btn-bg,#171717);color:var(--btn-fg,#fff);border:none;font-size:11px;font-weight:700;padding:4px 9px;border-radius:6px;text-decoration:none;white-space:nowrap;cursor:pointer;display:inline-flex;align-items:center;gap:3px}' +
    '.nl-ftr{display:flex;align-items:center;justify-content:space-between;font-size:10px;color:var(--muted,#737373);padding-top:8px;border-top:1px solid var(--bdr,#e5e5e5)}' +
    '.nl-link{color:inherit;text-decoration:none;font-weight:700}' +
    '.nl-link:hover{text-decoration:underline}' +
    '.nl-msg{font-size:11px;color:var(--muted,#737373);text-align:center;padding:10px 0}';

  function renderWidget(container, baseUrl) {
    if (container._nlInitialized) return;
    container._nlInitialized = true;

    var category = container.getAttribute('data-category') || '';
    var alternative = container.getAttribute('data-alternative') || '';
    var theme = container.getAttribute('data-theme') || 'auto';
    var max = parseInt(container.getAttribute('data-max') || '3', 10);
    var lang = container.getAttribute('data-lang') || 'en';
    var customTitle = container.getAttribute('data-title') || '';

    if (isNaN(max) || max < 1) max = 3;
    if (max > 6) max = 6;

    var themeClass = theme === 'dark' ? 'nl-dark' : theme === 'light' ? 'nl-light' : 'nl-auto';

    var shadow = container.attachShadow({ mode: 'open' });
    var styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    shadow.appendChild(styleEl);

    var card = document.createElement('div');
    card.className = 'nl-card ' + themeClass;
    shadow.appendChild(card);

    var headingTitle = customTitle;
    if (!headingTitle) {
      if (alternative) {
        headingTitle = alternative.charAt(0).toUpperCase() + alternative.slice(1) + ' Alternatives';
      } else if (category) {
        headingTitle = 'No-Login ' + category + ' Tools';
      } else {
        headingTitle = 'Zero-Login Privacy Tools';
      }
    }

    card.innerHTML =
      '<div class="nl-hdr">' +
        '<div class="nl-title">' +
          '<span>⚡</span>' +
          '<span>' + esc(headingTitle) + '</span>' +
        '</div>' +
        '<span class="nl-pill">Zero Sign-Up</span>' +
      '</div>' +
      '<div class="nl-list"><div class="nl-msg">Loading verified tools...</div></div>' +
      '<div class="nl-ftr">' +
        '<span>Verified by <a class="nl-link" href="https://nologintools.org" target="_blank" rel="noopener">NoLoginTools.org</a></span>' +
        '<a class="nl-link" href="' + esc(baseUrl + (lang === 'en' ? '' : '/' + lang)) + '" target="_blank" rel="noopener">Browse 300+ Tools &rarr;</a>' +
      '</div>';

    var listEl = card.querySelector('.nl-list');

    var params = new URLSearchParams();
    if (category) params.set('category', category);
    if (alternative) params.set('q', alternative);
    params.set('limit', String(max));

    var apiUrl = baseUrl + '/api/v1/tools?' + params.toString();

    fetch(apiUrl)
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        var tools = (json && json.data && json.data.tools) ? json.data.tools : [];
        if (!tools.length) {
          listEl.innerHTML = '<div class="nl-msg">Explore zero-registration tools on <a class="nl-link" href="' + esc(baseUrl) + '" target="_blank">nologin.tools</a></div>';
          return;
        }

        var html = '';
        for (var i = 0; i < Math.min(tools.length, max); i++) {
          var t = tools[i];
          var detailUrl = baseUrl + (lang === 'en' ? '' : '/' + lang) + '/tool/' + encodeURIComponent(t.slug);
          var directUrl = t.url || detailUrl;
          var domain = t.hostname || (t.url ? t.url.replace(/^https?:\/\//, '').split('/')[0] : '');
          var favicon = t.favicon || 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=32';

          var badgeTag = t.capabilities && t.capabilities.clientSideOnly
            ? '<span class="nl-tag">Client-Side</span>'
            : (t.capabilities && t.capabilities.worksOffline ? '<span class="nl-tag">Offline</span>' : '');

          html +=
            '<div class="nl-item">' +
              '<div class="nl-info">' +
                '<img class="nl-fav" src="' + esc(favicon) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'" />' +
                '<div class="nl-txt">' +
                  '<div class="nl-name">' +
                    '<a href="' + esc(detailUrl) + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">' + esc(t.name) + '</a>' +
                    badgeTag +
                  '</div>' +
                  '<div class="nl-desc" title="' + esc(t.description) + '">' + esc(t.task || t.description) + '</div>' +
                '</div>' +
              '</div>' +
              '<a class="nl-btn" href="' + esc(directUrl) + '" target="_blank" rel="noopener">Use &nearr;</a>' +
            '</div>';
        }
        listEl.innerHTML = html;
      })
      .catch(function () {
        listEl.innerHTML =
          '<div class="nl-msg">Browse curated tools at <a class="nl-link" href="' + esc(baseUrl) + '" target="_blank">nologin.tools</a></div>';
      });
  }

  function initWidgets() {
    var scripts = document.querySelectorAll('script[src*="widget.js"]');
    var currentScript = document.currentScript || (scripts.length ? scripts[scripts.length - 1] : null);
    var baseUrl = getOrigin(currentScript);

    // 1. Process explicit <div class="nologin-widget"> containers
    var divs = document.querySelectorAll('.nologin-widget');
    for (var i = 0; i < divs.length; i++) {
      renderWidget(divs[i], baseUrl);
    }

    // 2. Process self-mounting <script src="...widget.js" data-...> tags
    for (var j = 0; j < scripts.length; j++) {
      var s = scripts[j];
      if (s.hasAttribute('data-category') || s.hasAttribute('data-alternative') || s.hasAttribute('data-theme')) {
        if (!s._nlMounted) {
          s._nlMounted = true;
          var mountDiv = document.createElement('div');
          mountDiv.className = 'nologin-widget';
          var attrs = s.attributes;
          for (var k = 0; k < attrs.length; k++) {
            if (attrs[k].name.indexOf('data-') === 0) {
              mountDiv.setAttribute(attrs[k].name, attrs[k].value);
            }
          }
          s.parentNode.insertBefore(mountDiv, s.nextSibling);
          renderWidget(mountDiv, baseUrl);
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidgets);
  } else {
    initWidgets();
  }

  if (typeof window !== 'undefined') {
    window.NoLoginWidget = {
      init: initWidgets,
      render: renderWidget
    };
  }
})();
