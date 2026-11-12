/* ==========================================================================
   СХЕМА ПРОЕКТА «ПОРТМОНЕ» ДЛЯ ЯДРА ПАНЕЛИ (panel-core.js).

   Ядро одинаковое во всех витринах и про формат data.js ничего не знает.
   Здесь сказано только: какие у карточки поля и как разложить общий вид
   обратно в файл, который читает сайт: SITE / CATEGORIES / OFFERS.

   Порядок полей карточки = порядок полей в форме панели.
   ========================================================================== */

window.ADMIN = {
  brand: 'CardStart',
  dataFile: 'data.js',
  draftKey: 'portmone_admin_draft',
  preview: 'index.html?draft=1',

  /* erid печатаем, только если он реально есть в ссылке: у коротких ссылок
     его в адресе нет, и запрещать сохранение из-за этого нельзя. */
  requireErid: false,

  /* Карточку без ссылки сайт показывает с пометкой «Ссылка скоро появится»
     вместо кнопки — панель отмечает такие карточки в списке. */
  flagNoUrl: true,

  /* Блок «Логотип»: либо готовый файл, либо цветная плашка с инициалами.
     Цвет плашки сайт при необходимости затемняет сам. */
  logo: true,

  /* Карточка на сайте белая — от неё ядро считает контраст плашки. */
  surface: '#FFFFFF',
  defaultTone: { bg: '#8347E6', ink: '#FFFFFF' },

  /* Готовые логотипы из img/logos. Своя картинка грузится кнопкой
     «Выбрать файл…» в карточке. */
  presets: [
    { label: 'Банки', items: [
      { name: 'Ак Барс Банк', value: 'img/logos/akbars.png' },
      { name: 'Альфа-Банк', value: 'img/logos/alfabank.png' },
      { name: 'ВТБ', value: 'img/logos/vtb.png' },
      { name: 'Банк Зенит', value: 'img/logos/zenit.png' },
      { name: 'Кредит Европа Банк', value: 'img/logos/crediteurope.svg' },
      { name: 'Ozon Банк', value: 'img/logos/ozon.png' },
      { name: 'ОТП Банк', value: 'img/logos/otp.png' },
      { name: 'ПСБ', value: 'img/logos/psb.png' },
      { name: 'Сбербанк', value: 'img/logos/sberbank.png' },
      { name: 'Совкомбанк', value: 'img/logos/sovcombank.png' },
      { name: 'Т-Банк / Т-Мобайл', value: 'img/logos/tbank.png' },
      { name: 'УБРиР', value: 'img/logos/ubrir.png' },
      { name: 'Уралсиб', value: 'img/logos/uralsib.png' },
      { name: 'Фора-Банк', value: 'img/logos/forabank.svg' }
    ] },
    { label: 'МФО и займы', items: [
      { name: 'А Деньги', value: 'img/logos/adengi.png' },
      { name: 'Быстроденьги', value: 'img/logos/bistrodengi.png' },
      { name: 'Деньги на дом', value: 'img/logos/denginadom.png' },
      { name: 'Деньги сразу', value: 'img/logos/dengisrazu.png' },
      { name: 'До Зарплаты', value: 'img/logos/dozarplati.png' },
      { name: 'Займер', value: 'img/logos/zaymer.png' },
      { name: 'Лайм-Займ', value: 'img/logos/limezaim.png' },
      { name: 'МигКредит', value: 'img/logos/migcredit.png' },
      { name: 'Надо денег', value: 'img/logos/nadodeneg.svg' },
      { name: 'Привет, сосед!', value: 'img/logos/privet-sosed.png' },
      { name: 'Свои Люди', value: 'img/logos/svoiludi.png' },
      { name: 'СМС Финанс', value: 'img/logos/smsfinance.png' },
      { name: 'Срочно Деньги', value: 'img/logos/srochnodengi.png' },
      { name: 'Турбозайм', value: 'img/logos/turbozaim.svg' },
      { name: 'Умные Наличные', value: 'img/logos/umnye-nalichnye.png' },
      { name: 'Центрофинанс', value: 'img/logos/centrofinans.png' },
      { name: 'Joymoney', value: 'img/logos/joymoney.png' },
      { name: 'Max.Credit', value: 'img/logos/maxcredit.png' },
      { name: 'MoneyMan', value: 'img/logos/moneyman.png' },
      { name: 'OneClickMoney', value: 'img/logos/oneclickmoney.png' },
      { name: 'Platiza', value: 'img/logos/platiza.png' },
      { name: 'Rocketman', value: 'img/logos/rocketman.png' },
      { name: 'Webbankir', value: 'img/logos/webbankir.png' },
      { name: 'Zaymigo', value: 'img/logos/zaymigo.png' }
    ] }
  ],

  /* Только то, что сайт действительно показывает. */
  site: [
    { key: 'brand',   label: 'Название сайта', required: true,
      hint: 'Стоит в шапке, в подвале и в заголовке вкладки браузера. Рядом со значком карты в шапке.' },
    { key: 'tagline', label: 'Плашка над заголовком',
      hint: '«47 предложений банков и МФО». Число в начале сайт подставляет сам — по числу карточек на сайте.' },
    { key: 'telegram', label: 'Telegram для связи',
      hint: 'Ник без @ или ссылка t.me/… Появится в меню, в подвале и на кнопке под вопросами («Задать вопрос в Telegram»). Пусто — не показывается.' },
    { key: 'updated', label: 'Дата обновления условий',
      hint: 'Печатается в блоке «Почему нам доверяют» и в подвале: «Условия проверены 10.11.2026».' }
  ],

  groups: [
    { key: 'title',  label: 'Название раздела', required: true,
      hint: 'Тёмная часть заголовка, пункт меню и плитка под первым экраном: «Дебетовые карты».' },
    { key: 'accent', label: 'Цветная часть заголовка',
      hint: 'Вторая часть заголовка фиолетовым: «на каждый день». Можно оставить пустым.' },
    { key: 'lead',   label: 'Подпись под заголовком', textarea: true,
      hint: 'Одно предложение о разделе.' },
    { key: 'cta',    label: 'Надпись на кнопках', required: true,
      hint: 'Одна на все карточки раздела: «Оформить карту», «Получить деньги».' },
    { key: 'warning', label: 'Предупреждения в карточках', textarea: true,
      hint: 'Только для кредитов и займов: обязательные фразы по статье 28 закона «О рекламе», по строке на фразу. Печатаются в каждой карточке раздела. Для дебетовых карт и счетов оставьте пустым.' }
  ],

  card: [
    { key: 'partner',  label: 'Банк или МФО', required: true,
      hint: 'Надпись рядом с логотипом: «ВТБ», «MoneyMan».' },
    { key: 'tag',      label: 'Тип продукта',
      hint: 'Мелкая подпись под названием: «дебетовая карта», «займ онлайн».' },
    { key: 'title',    label: 'Название продукта', required: true,
      hint: 'Крупная строка карточки: «Твой Кешбэк», «Платинум». Если совпадает с названием банка или МФО, крупно идёт строка выгоды.' },
    { key: 'headline', label: 'Строка выгоды', required: true,
      hint: 'Главное преимущество: «Кэшбэк рублями», «Деньги на карту». У кредитов и займов не пишите сроки и ставки без полной стоимости (ПСК) — это нарушение закона о рекламе.' },
    { key: 'note',     label: 'Пояснение к выгоде',
      hint: 'Например «категории выбираете сами».' },
    { key: 'specs',    label: 'Условия', type: 'pairs',
      hint: 'По строке на условие, через двоеточие: «Доставка: курьером». Сайт показывает первые три.' },
    { key: 'url',      label: 'Партнёрская ссылка', type: 'url',
      hint: 'Вставьте ссылку из партнёрки целиком, вместе с erid и метками. Пока пусто — на сайте вместо кнопки «Ссылка скоро появится», а в списке панели пометка.' },
    { key: 'advertiser', label: 'Рекламодатель для маркировки',
      hint: 'Юрлицо и ИНН из кабинета партнёрки: «АО «ТБанк», ИНН 7710140679». Печатается под кнопкой: «Реклама. …. erid: …». Пусто — подставится название банка или МФО.' }
  ],

  /* ---------------------------------------------- чтение --------------- */

  load: function () {
    var groups = CATEGORIES.map(function (c) {
      return { key: c.id, title: c.label, accent: c.accent || '', lead: c.lead || '', cta: c.cta, warning: c.warning || '' };
    });

    var seen = {};
    var cards = OFFERS.map(function (o, i) {
      /* Устойчивый ключ: в файле его нет, а ядру он нужен, чтобы не путать
         карточки при перестановке. Считаем от раздела, компании и продукта. */
      var base = ((o.cat || '') + '-' + (o.partner || '') + '-' + (o.title || '')).toLowerCase()
        .replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 48) || ('c' + i);
      var uid = base, n = 2;
      while (seen[uid]) uid = base + '-' + (n++);
      seen[uid] = true;

      return {
        uid: uid,
        group: o.cat,
        hidden: !!o.hidden,
        partner: o.partner || '',
        tag: o.tag || '',
        title: o.title || '',
        headline: o.headline || '',
        note: o.note || '',
        specs: (o.specs || []).map(function (p) { return [p[0], p[1]]; }),
        url: o.url || '',
        advertiser: o.advertiser || '',
        logo: o.logo || '',
        /* Цвета плашки читаем всегда: даже у карточки с логотипом они
           переживают круговорот, иначе следующее сохранение затрёт выбор. */
        tone: { bg: (o.tone && o.tone.bg) || '#8347E6', ink: (o.tone && o.tone.ink) || '#FFFFFF' }
      };
    });

    return {
      SITE: JSON.parse(JSON.stringify(SITE)),
      GROUPS: groups,
      CARDS: cards
    };
  },

  /* ---------------------------------------------- сборка файла --------- */

  build: function (m) {
    function js(v) { return JSON.stringify(v, null, 2); }
    function t(v) { return String(v == null ? '' : v).trim(); }

    var categories = m.GROUPS.map(function (g) {
      return {
        id: g.key, label: t(g.title), accent: t(g.accent), lead: t(g.lead), cta: t(g.cta) || 'Оформить',
        /* По строке на фразу; пустые строки и хвостовые пробелы убираем. */
        warning: t(g.warning).split(/\r?\n/).map(t).filter(Boolean).join('\n')
      };
    });

    var offers = m.CARDS.map(function (c) {
      var o = {
        cat: c.group,
        partner: t(c.partner),
        tag: t(c.tag),
        title: t(c.title),
        logo: t(c.logo),
        tone: { bg: t(c.tone && c.tone.bg) || '#8347E6', ink: t(c.tone && c.tone.ink) || '#FFFFFF' },
        headline: t(c.headline),
        note: t(c.note),
        specs: (c.specs || []).map(function (p) { return [t(p[0]), t(p[1])]; })
          .filter(function (p) { return p[0] || p[1]; }),
        advertiser: t(c.advertiser),
        url: t(c.url)
      };
      if (c.hidden) o.hidden = true;
      return o;
    });

    return [
      '/* ═════════════════════════════════════════════════════════════════════════',
      '   КАТАЛОГ «' + (t(m.SITE.brand) || 'ПОРТМОНЕ').toUpperCase() + '» — единственный файл с предложениями.',
      '   Собран панелью ' + new Date().toLocaleString('ru-RU') + '.',
      '',
      '   Правится через panel.html. Руками тоже можно, но при следующем',
      '   сохранении из панели правки будут перезаписаны.',
      '',
      '   cat        — раздел: debit | credit | mfo (или новый, заведённый в панели).',
      '   url        — партнёрская ссылка. Пусто — вместо кнопки «Ссылка скоро появится».',
      '   advertiser — рекламодатель для маркировки: «ООО …, ИНН …». Пусто — название партнёра.',
      '   logo       — файл логотипа. Пусто — плашка с инициалами цвета tone.bg.',
      '   title      — название продукта (крупная строка), headline и note — выгода под ним.',
      '   specs      — пары «условие: значение».',
      '   warning    — у раздела: обязательные предупреждения в карточках кредитов и займов.',
      '',
      '   ВАЖНО ПРО ЦИФРЫ: ставки, лимиты, кэшбэк и сроки ставьте только те,',
      '   что подтверждены вашей партнёркой. В рекламе кредита или займа условие',
      '   без полной стоимости (ПСК) — нарушение ст. 28 закона «О рекламе».',
      '   ═════════════════════════════════════════════════════════════════════════ */',
      '',
      'const SITE = ' + js(m.SITE) + ';',
      '',
      '/* label + accent — двухцветный заголовок раздела; cta — надпись на кнопках. */',
      'const CATEGORIES = ' + js(categories) + ';',
      '',
      'const OFFERS = ' + js(offers) + ';',
      ''
    ].join('\n');
  }
};
