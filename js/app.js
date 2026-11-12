/* ═══════════════════════════════════════════════════════════════════════
   ВИТРИНА «ПОРТМОНЕ» — тексты из панели, разделы каталога, меню, анимации.

   Каталог объявлен глобальными const в data.js (или data.php на хостинге
   с PHP). const мимо window не переприсвоить, поэтому работаем с копиями:
   на адресе index.html?draft=1 вместо боевого файла подставляется черновик
   из панели управления.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var site   = typeof SITE       !== 'undefined' ? SITE       : {};
  var cats   = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
  var offers = typeof OFFERS     !== 'undefined' ? OFFERS     : [];

  if (/[?&]draft/.test(location.search)) {
    try {
      var draftFile = localStorage.getItem('portmone_admin_draft:file');
      if (draftFile) {
        var d = new Function(draftFile + '\n;return { SITE: SITE, CATEGORIES: CATEGORIES, OFFERS: OFFERS };')();
        site = d.SITE || site; cats = d.CATEGORIES || cats; offers = d.OFFERS || offers;
      }
    } catch (e) { /* битый черновик — показываем боевой каталог */ }
  }

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── мелкие помощники ─────────────────────────────────────────────── */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function initials(name) {
    return String(name || '?').trim().split(/[\s,.-]+/).filter(Boolean).slice(0, 2)
      .map(function (w) { return w.charAt(0); }).join('').toUpperCase();
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }
  function offersWord(n) { return plural(n, 'предложение', 'предложения', 'предложений'); }
  function two(n) { return (n < 10 ? '0' : '') + n; }

  /* Ссылка считается настоящей, только если это http(s) с доменом через
     точку: «https://» из пустого поля панели кнопкой не становится. */
  function okLink(u) { return /^https?:\/\/[^\/\s?#]+\.[^\/\s?#]{2,}/i.test(String(u || '').trim()); }

  /* Маркировка: erid печатаем, только если он похож на номер. Заглушки
     вида erid=* или пустые хвосты пропускаем — выдумывать нельзя. */
  function eridOf(u) {
    var m = String(u || '').match(/[?&]erid=([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : '';
  }

  /* Цвет плашки с инициалами затемняем, пока белый текст на ней не станет
     читаемым (4.5:1) — испортить контраст из панели нельзя. */
  function lum(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.replace(/./g, '$&$&');
    if (!/^[0-9a-f]{6}$/i.test(h)) return null;
    return [0, 2, 4].map(function (i) {
      var c = parseInt(h.substr(i, 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }).reduce(function (s, c, i) { return s + c * [0.2126, 0.7152, 0.0722][i]; }, 0);
  }
  function contrast(a, b) {
    var la = lum(a), lb = lum(b);
    if (la == null || lb == null) return 0;
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  /* Своя пара «фон — подпись» из панели (жёлтый Т-Банка с тёмной буквой)
     остаётся как есть, если читается; иначе — белые инициалы на фоне,
     затемнённом до 4.5:1. */
  function tilePaint(tone) {
    if (tone && contrast(tone.bg, tone.ink) >= 4.5) return { bg: tone.bg, ink: tone.ink };
    return { bg: safeTone(tone && tone.bg), ink: '#FFFFFF' };
  }
  function safeTone(bg) {
    var h = String(bg || '').replace('#', '');
    if (lum(h) == null) return '#B0101A';
    if (h.length === 3) h = h.replace(/./g, '$&$&');
    var rgb = [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); });
    for (var k = 0; k < 20; k++) {
      var hex = '#' + rgb.map(function (c) { return ('0' + Math.round(c).toString(16)).slice(-2); }).join('');
      if ((1.05) / (lum(hex) + 0.05) >= 4.5) return hex;
      rgb = rgb.map(function (c) { return c * 0.88; });
    }
    return '#5E0A10';
  }

  /* ── данные ───────────────────────────────────────────────────────── */

  var live = offers.filter(function (o) { return !o.hidden; }).map(function (o, i) {
    return {
      i: i,
      cat: o.cat,
      partner: String(o.partner || '').trim(),
      tag: String(o.tag || '').trim(),
      title: String(o.title || '').trim(),
      headline: String(o.headline || '').trim(),
      note: String(o.note || '').trim(),
      specs: (o.specs || []).filter(function (p) { return p && (p[0] || p[1]); }).slice(0, 3),
      url: okLink(o.url) ? String(o.url).trim() : '',
      logo: String(o.logo || '').trim(),
      tone: o.tone || {},
      advertiser: String(o.advertiser || '').trim().replace(/\.$/, '')
    };
  });

  var byCat = {};
  live.forEach(function (o) { (byCat[o.cat] = byCat[o.cat] || []).push(o); });
  /* Пустой раздел не показываем вовсе: заголовок без карточек — тупик. */
  var shownCats = cats.filter(function (c) { return (byCat[c.id] || []).length; });
  var total = shownCats.reduce(function (s, c) { return s + byCat[c.id].length; }, 0);

  var firms = {};
  live.forEach(function (o) { if (o.partner && byCat[o.cat] && shownCats.some(function (c) { return c.id === o.cat; })) firms[o.partner.toLowerCase()] = 1; });
  var nFirms = Object.keys(firms).length;

  /* ── тексты сайта из панели ───────────────────────────────────────── */

  var brand = String(site.brand || '').trim();
  if (brand) {
    $all('[data-brand]').forEach(function (n) { n.textContent = brand; });
    /* На главной логотип ведёт в начало этой же страницы, на странице
       документа — на главную: имя ссылки говорит, что произойдёт. */
    $all('a.brand').forEach(function (a) {
      var same = (a.getAttribute('href') || '').charAt(0) === '#';
      a.setAttribute('aria-label', brand + (same ? ' — в начало страницы' : ' — на главную'));
    });
    if (document.getElementById('hero-title')) {
      document.title = brand + ' — карты банков и займы онлайн на одной странице';
    } else if (/privacy/.test(location.pathname)) {
      document.title = 'Политика обработки данных — ' + brand;
    }
  }
  /* Число в начале плашки сайт ставит сам — по карточкам, которые реально
     видны: скрыли карточку в панели — число уменьшилось. */
  var tagline = document.querySelector('[data-tagline]');
  if (tagline && site.tagline) {
    tagline.textContent = String(site.tagline).replace(/^\s*\d+(\s+\S+)?/, function (m0, w) {
      return total + (w && /^\s+предлож/i.test(w) ? ' ' + offersWord(total) : (w || ''));
    });
  }
  var leadEl = document.querySelector('[data-lead]');
  if (leadEl && site.lead) leadEl.textContent = site.lead;
  $all('[data-updated]').forEach(function (n) { if (site.updated) n.textContent = site.updated; });
  $all('[data-total]').forEach(function (n) { n.textContent = String(total); });
  $all('[data-total-word]').forEach(function (n) { n.textContent = offersWord(total); });
  $all('[data-firms]').forEach(function (n) {
    n.textContent = nFirms + ' ' + plural(nFirms, 'компания', 'компании', 'компаний');
  });

  /* Telegram в подвале: ник, @ник или ссылка t.me — всё приводим к ссылке. */
  var tg = String(site.telegram || '').trim()
    .replace(/^@/, '').replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '').replace(/[\/?#].*$/, '');
  $all('[data-telegram]').forEach(function (box) {
    if (!/^[A-Za-z0-9_]{4,32}$/.test(tg)) { box.hidden = true; return; }
    var a = box.querySelector('a');
    if (a) { a.href = 'https://t.me/' + tg; a.querySelector('[data-tg-name]').textContent = '@' + tg; }
    box.hidden = false;
  });
  /* Есть Telegram — нижняя кнопка блока вопросов ведёт в него, как
     «Задать вопрос» в референсе. Нет — остаётся «Смотреть предложения». */
  var faqCta = document.querySelector('[data-faq-cta]');
  if (faqCta && /^[A-Za-z0-9_]{4,32}$/.test(tg)) {
    faqCta.href = 'https://t.me/' + tg;
    faqCta.innerHTML = 'Задать вопрос в Telegram<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-tg"/></svg>';
  }

  /* ── меню, плитки разделов, партнёры, цена ───────────────────────── */

  /* Пункты меню (шапка и подвал), плитки разделов, кнопки первого экрана
     и список в блоке цены собираются из тех же разделов, что и каталог:
     переименовали раздел в панели — поменялось везде. */
  ['nav-list', 'foot-nav-list'].forEach(function (id) {
    var list = document.getElementById(id);
    if (!list || !shownCats.length) return;
    var anchor = list.querySelector('[data-nav-static]');
    $all('[data-nav-cat]', list).forEach(function (li) { li.remove(); });
    shownCats.forEach(function (c) {
      var li = document.createElement('li');
      li.setAttribute('data-nav-cat', '');
      li.innerHTML = '<a href="#' + esc(c.id) + '">' + esc(c.label) + '</a>';
      list.insertBefore(li, anchor);
    });
  });

  var ICON = { debit: 'card', credit: 'cardpay', mfo: 'cash', loans: 'cash', sim: 'phone' };
  var TEXT = {
    debit: 'Кешбэк, процент на остаток, оплата телефоном.',
    credit: 'Кредитный лимит и льготный период.',
    mfo: 'Займы на карту без визита в офис.'
  };
  var kinds = document.getElementById('kinds');
  if (kinds && shownCats.length) {
    kinds.innerHTML = shownCats.map(function (c) {
      var n = byCat[c.id].length;
      var text = TEXT[c.id] || (String(c.lead || '').match(/^[^.!?]*[.!?]?/) || [''])[0] || '';
      return '<li><a class="kind" href="#' + esc(c.id) + '">' +
        '<span class="kind__ico" aria-hidden="true"><svg class="ico"><use href="#i-' + (ICON[c.id] || 'wallet') + '"/></svg></span>' +
        '<span class="kind__body"><span class="kind__title">' + esc(c.label) + '</span><span class="vh">,</span>' +
        (text ? '<span class="kind__text">' + esc(text) + '</span>' : '') +
        '<span class="kind__count">' + n + ' ' + offersWord(n) +
        '<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-down"/></svg></span></span></a></li>';
    }).join('');
    kinds.closest('.kinds__list').style.gridTemplateColumns = shownCats.length < 3 ? 'repeat(' + shownCats.length + ', minmax(0, 1fr))' : '';
  }

  /* Кнопки первого экрана и блока цены: «Выбрать карту» — первый раздел,
     «Займы онлайн» — раздел МФО (если его убрали — последний раздел). */
  if (shownCats.length) {
    $all('[data-first-cat]').forEach(function (a) { a.setAttribute('href', '#' + shownCats[0].id); });
    var loanCat = shownCats.filter(function (c) { return c.id === 'mfo'; })[0] || shownCats[shownCats.length - 1];
    $all('[data-mfo-link]').forEach(function (a) { a.setAttribute('href', '#' + loanCat.id); });
  }

  /* Банки на витрине: по одному на логотип, только из разделов карт
     (у МФО свой раздел). Имя видно рядом, поэтому alt пустой. */
  var partners = document.getElementById('partners');
  if (partners) {
    var seenP = {}, banks = [], nMfo = 0, seenM = {};
    live.forEach(function (o) {
      if (!shownCats.some(function (c) { return c.id === o.cat; })) return;
      if (o.cat === 'mfo') { if (!seenM[o.partner.toLowerCase()]) { seenM[o.partner.toLowerCase()] = 1; nMfo++; } return; }
      var key = o.logo || o.partner.toLowerCase();
      if (seenP[key]) return;
      seenP[key] = 1;
      banks.push(o);
    });
    partners.innerHTML = banks.map(function (o) {
      var paint = tilePaint(o.tone);
      var pic = o.logo
        ? '<img src="' + esc(o.logo) + '" alt="" width="44" height="44" loading="lazy" decoding="async">'
        : '<span class="partners__txt" style="background:' + esc(paint.bg) + ';color:' + esc(paint.ink) + '" aria-hidden="true">' + esc(initials(o.partner)) + '</span>';
      return '<li>' + pic + '<span>' + esc(o.partner) + '</span></li>';
    }).join('');
    var more = document.getElementById('partners-more');
    var mfoCat = shownCats.filter(function (c) { return c.id === 'mfo'; })[0];
    if (more && nMfo && mfoCat) {
      more.innerHTML = 'Ещё ' + nMfo + ' МФО — <a href="#mfo">в разделе «' + esc(mfoCat.label) + '»</a>';
      more.hidden = false;
    }
  }

  /* Список в блоке «Сколько стоит подбор» — по разделам. */
  var priceList = document.getElementById('price-list');
  if (priceList && shownCats.length) {
    var word = function (c, n) {
      if (c.id === 'debit') return n + ' ' + plural(n, 'дебетовая карта', 'дебетовые карты', 'дебетовых карт');
      if (c.id === 'credit') return n + ' ' + plural(n, 'кредитная карта', 'кредитные карты', 'кредитных карт');
      if (c.id === 'mfo') return n + ' ' + plural(n, 'займ', 'займа', 'займов') + ' в МФО';
      return c.label + ': ' + n;
    };
    priceList.innerHTML = shownCats.map(function (c) { return '<li>' + esc(word(c, byCat[c.id].length)) + '</li>'; }).join('') +
      '<li>Переход на официальный сайт партнёра</li><li>Без комиссий и регистрации</li>';
  }

  /* ── карточки ─────────────────────────────────────────────────────── */

  var ctaByCat = {}, warnByCat = {};
  cats.forEach(function (c) {
    ctaByCat[c.id] = c.cta || 'Оформить';
    /* Предупреждения для кредитов и займов (ч. 2.1 и 3.1 ст. 28 закона
       «О рекламе») задаются у раздела, по строке на фразу, и печатаются
       в каждой его карточке — обычным текстом, не мельче остального. */
    warnByCat[c.id] = String(c.warning || '').split(/\n+/)
      .map(function (w) { return w.trim(); }).filter(Boolean);
  });

  function cardHTML(o) {
    var cta = ctaByCat[o.cat] || 'Оформить';
    var id = 'o' + o.i;
    var paint = tilePaint(o.tone);

    var logo = o.logo
      ? '<span class="card__logo"><img src="' + esc(o.logo) + '" alt="" width="52" height="52" loading="lazy" decoding="async"></span>'
      : '<span class="card__logo card__logo--text" style="background:' + esc(paint.bg) +
        ';color:' + esc(paint.ink) + '">' + esc(initials(o.partner)) + '</span>';

    /* Крупная строка — название продукта («Твой Кешбэк», Black). У займов
       продукт называется так же, как компания: там крупно идёт выгода. */
    var named = o.title && o.title.toLowerCase() !== o.partner.toLowerCase();
    var big = named ? o.title : o.headline;
    var sub = named ? [o.headline, o.note].filter(Boolean).join(' — ') : o.note;

    var specs = o.specs.map(function (p) {
      return '<li><span class="card__spec-k">' + esc(p[0]) + '<span class="vh">:</span></span>' +
        '<span class="card__spec-v">' + esc(p[1]) + '</span></li>';
    }).join('');

    /* Без noreferrer: часть партнёрок считает переход по Referer, и
       обрезанный заголовок теряет атрибуцию. noopener отрезает window.opener.

       Видимая надпись на кнопках раздела одна и та же, поэтому к ней
       дописано скрытое продолжение с продуктом: иначе в списке ссылок
       скринридера получились бы десятки одинаковых строк. Видимый текст
       стоит в начале имени дословно — голосовое управление его найдёт. */
    var erid = eridOf(o.url);
    var warn = (warnByCat[o.cat] || []).length
      ? '<div class="card__warn">' + warnByCat[o.cat].map(function (w) { return '<p>' + esc(w) + '</p>'; }).join('') + '</div>'
      : '';
    var foot = o.url
      ? '<a class="cbtn" href="' + esc(o.url) + '" target="_blank" rel="sponsored nofollow noopener">' +
          '<span class="cbtn__text">' + esc(cta) +
            '<span class="vh">: ' + esc(named ? o.title + ', ' + o.partner : o.partner) + ' (откроется в новой вкладке)</span></span>' +
          '<span class="cbtn__ico" aria-hidden="true"><svg class="ico"><use href="#i-arrow"/></svg></span>' +
        '</a>' +
        /* Маркировка: рекламодатель из панели («ООО …, ИНН …»), а пока его
           нет — название партнёра. */
        '<p class="card__ad">Реклама. ' + esc(o.advertiser || o.partner) + (erid ? '. erid: ' + esc(erid) : '') + '</p>'
      /* Ссылки ещё нет — честная пометка вместо кнопки, которая никуда не ведёт. */
      : '<p class="card__soon">Ссылка скоро появится</p>';

    return '' +
      '<li class="cards__item"><article class="card' + (o.url ? '' : ' card--nolink') + '" aria-labelledby="' + id + '-name">' +
        '<div class="card__head">' + logo +
          '<div class="card__id">' +
            /* У одного банка бывает несколько продуктов (ВТБ — пять): хвост
               с названием продукта делает заголовки различимыми на слух. */
            '<h3 class="card__partner" id="' + id + '-name">' + esc(o.partner) +
              (named ? '<span class="vh">: ' + esc(o.title) + '</span>' : '') + '</h3>' +
            (o.tag ? '<p class="card__tag">' + esc(o.tag) + '</p>' : '') +
          '</div>' +
        '</div>' +
        (big ? '<p class="card__big"' + (named ? ' aria-hidden="true"' : '') + '>' + esc(big) + '</p>' : '') +
        (sub ? '<p class="card__sub">' + esc(sub) + '</p>' : '') +
        (specs ? '<ul class="card__specs" role="list">' + specs + '</ul>' : '') +
        '<div class="card__foot">' + warn + foot + '</div>' +
      '</article></li>';
  }

  var catalog = document.getElementById('catalog');
  if (catalog) {
    catalog.innerHTML = shownCats.map(function (c, n) {
      var list = byCat[c.id];
      return '' +
        '<section class="sec cat reveal" id="' + esc(c.id) + '" aria-labelledby="' + esc(c.id) + '-title">' +
          '<div class="wrap">' +
            '<div class="sec__head">' +
              '<p class="sec__idx"><span class="sec__num" aria-hidden="true">' + two(n + 1) + '</span>' +
                '<span class="sec__count">' + list.length + ' ' + offersWord(list.length) + '</span></p>' +
              '<h2 class="h2" id="' + esc(c.id) + '-title">' + esc(c.label) +
                (c.accent ? ' <span class="accent">' + esc(c.accent) + '</span>' : '') + '</h2>' +
              (c.lead ? '<p class="sec__lead">' + esc(c.lead) + '</p>' : '') +
            '</div>' +
            '<ul class="cards' + (c.id === 'mfo' || list.length > 16 ? ' cards--dense' : '') + '" role="list">' + list.map(cardHTML).join('') + '</ul>' +
          '</div>' +
        '</section>';
    }).join('');
  }

  /* ── вкладки разделов ─────────────────────────────────────────────
     Над каталогом — вкладки «Все предложения / раздел / раздел…» (паттерн
     ARIA tabs, одна общая панель #catalog). Строятся из тех же разделов,
     что и каталог: переименовали раздел в панели — поменялась вкладка.
     Ссылки на разделы (#debit и т. п.) в шапке, подвале, плитках и кнопках
     не прыгают к якорю, а включают свою вкладку. */
  var catIds = shownCats.map(function (c) { return c.id; });
  if (catalog && shownCats.length > 1) {
    var ALL = 'all';
    var tabDefs = [{ id: ALL, label: 'Все', more: ' предложения', n: total }].concat(shownCats.map(function (c) {
      return { id: c.id, label: c.label, n: byCat[c.id].length };
    }));
    var tabsWrap = document.createElement('div');
    tabsWrap.className = 'wrap tabs-wrap';
    tabsWrap.innerHTML = '<div class="tabs" role="tablist" aria-label="Разделы предложений">' +
      tabDefs.map(function (t) {
        return '<button type="button" role="tab" class="tab" id="tab-' + esc(t.id) + '" data-tab="' + esc(t.id) + '"' +
          ' aria-controls="catalog" aria-selected="false" tabindex="-1">' +
          '<svg class="ico tab__ico" aria-hidden="true" focusable="false"><use href="#i-circle"/></svg>' +
          /* На телефоне хвост «предложения» прячется: «Все» помещается в полвкладки. */
          '<span class="tab__label">' + esc(t.label) + (t.more ? '<span class="tab__more">' + esc(t.more) + '</span>' : '') + '</span><span class="vh">,</span>' +
          '<span class="tab__count">' + t.n + '<span class="vh"> ' + offersWord(t.n) + '</span></span>' +
        '</button>';
      }).join('') + '</div>';
    catalog.parentNode.insertBefore(tabsWrap, catalog);
    var tabList = tabsWrap.firstChild;
    var tabs = $all('[role="tab"]', tabList);
    catalog.setAttribute('role', 'tabpanel');
    catalog.setAttribute('tabindex', '0');
    var sections = $all('.cat', catalog);
    var current = null;

    var selectTab = function (id, focus) {
      if (id !== ALL && catIds.indexOf(id) < 0) id = ALL;
      var active = document.activeElement;
      var tab = null;
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === id;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
        var use = t.querySelector('use');
        if (use) use.setAttribute('href', on ? '#i-check' : '#i-circle');
        if (on) tab = t;
      });
      var first = true;
      sections.forEach(function (sec) {
        var show = id === ALL || sec.id === id;
        /* Фокус был в разделе, который сейчас спрячется, — уводим на вкладку. */
        if (!show && active && sec.contains(active)) focus = true;
        sec.hidden = !show;
        sec.classList.toggle('cat--first', show && first);
        /* Показанный раздел не ждёт анимации появления — иначе кнопка
           в нём может получить фокус, оставаясь прозрачной. */
        if (show) { sec.classList.add('is-in'); first = false; }
      });
      catalog.setAttribute('aria-labelledby', tab.id);
      current = id;
      if (focus) tab.focus({ preventScroll: true });
    };

    var showTabs = function () {
      tabsWrap.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    };

    /* Адрес повторяет выбранную вкладку (#mfo и т. п.) — ссылкой на раздел
       можно поделиться; у «Все предложения» хвоста нет. */
    var keepHash = function (id) {
      if (!history.replaceState) return;
      history.replaceState(null, '', id === ALL ? location.pathname + location.search : '#' + id);
    };
    tabList.addEventListener('click', function (e) {
      var t = e.target.closest('[role="tab"]');
      if (!t) return;
      selectTab(t.getAttribute('data-tab'), true);
      keepHash(current);
    });
    tabList.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var to = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = tabs.length - 1;
      if (to === null) return;
      e.preventDefault();
      selectTab(tabs[to].getAttribute('data-tab'), true);
      keepHash(current);
    });

    /* Любая ссылка на раздел включает его вкладку. Слушатель на документе
       срабатывает после бургера, так что мобильное меню успевает закрыться. */
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (catIds.indexOf(id) < 0) return;
      e.preventDefault();
      selectTab(id, false);
      keepHash(id);
      showTabs();
      tabs.filter(function (t) { return t.getAttribute('data-tab') === id; })[0].focus({ preventScroll: true });
    });

    var fromHash = function () {
      var id = decodeURIComponent(location.hash.slice(1));
      if (catIds.indexOf(id) < 0) return false;
      selectTab(id, false);
      showTabs();
      return true;
    };
    window.addEventListener('hashchange', fromHash);
    if (!fromHash()) selectTab(ALL, false);
  }

  /* ── мобильное меню ───────────────────────────────────────────────── */

  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    var setOpen = function (open, focusBack) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
      if (!open && focusBack) burger.focus();
    };
    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true', false);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && burger.getAttribute('aria-expanded') === 'true') setOpen(false, false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setOpen(false, true);
    });
    /* Фокус ушёл из меню дальше по странице — закрываем панель, иначе он
       окажется под ней (низкий экран, телефон горизонтально). */
    burger.parentNode.addEventListener('focusout', function (e) {
      var to = e.relatedTarget;
      if (burger.getAttribute('aria-expanded') === 'true' && to && to !== burger && !nav.contains(to)) setOpen(false, false);
    });
    /* Выросло окно — меню снова строкой в шапке, флаг сбрасываем. */
    var mq = matchMedia('(min-width: 1100px)');
    var onMq = function () { if (mq.matches) setOpen(false, false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  /* Нижняя линия шапки темнеет, когда страница уехала из-под неё. */
  var header = document.querySelector('.hdr');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── появление блоков и счёт цифр ─────────────────────────────────── */

  /* Без поддержки наблюдателя или при «меньше движения» всё видно сразу.
     Класс js-reveal на <html> прячет блоки только тогда, когда скрипт
     точно жив и сможет их показать. */
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduce || to < 2) { el.textContent = String(to); return; }
    var t0 = null, dur = 900;
    var step = function (t) {
      if (t0 == null) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    /* Скрытая вкладка морозит rAF — через секунду число ставим в любом случае. */
    setTimeout(function () { el.textContent = String(to); }, dur + 200);
  }

  var revealEls = $all('.reveal, .hero__art');
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        $all('[data-count]', en.target).forEach(countUp);
        io.unobserve(en.target);
      });
    /* Порог 0: раздел из 24 карточек на низком экране иначе никогда не
       наберёт нужную долю видимой площади. */
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    revealEls.forEach(function (el) { io.observe(el); });
    /* Подстраховка: если наблюдатель так и не сработал (печать, скрытая
       панель предпросмотра), через 2,5 с показываем всё. */
    setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('is-in'); }); }, 2500);
  }
})();
