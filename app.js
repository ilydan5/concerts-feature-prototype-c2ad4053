const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const sheetBackdrop = $('#sheetBackdrop');
const bottomSheet = $('#bottomSheet');
const sheetContent = $('#sheetContent');
const toast = $('#toast');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function openSheet(html) {
  sheetContent.innerHTML = html;
  sheetBackdrop.classList.add('open');
  bottomSheet.classList.add('open');
  bottomSheet.setAttribute('aria-hidden', 'false');
  $('.close-sheet', bottomSheet)?.addEventListener('click', closeSheet);
}

function closeSheet() {
  sheetBackdrop.classList.remove('open');
  bottomSheet.classList.remove('open');
  bottomSheet.setAttribute('aria-hidden', 'true');
}

sheetBackdrop.addEventListener('click', closeSheet);

function setPanel(panelId) {
  $$('.panel').forEach(panel => panel.classList.toggle('active', panel.id === panelId));
  $$('[data-tab]').forEach(button => button.classList.toggle('active', button.dataset.tab === panelId));
}

$$('[data-heart]').forEach(button => {
  button.addEventListener('click', event => {
    event.stopPropagation();
    button.classList.toggle('tracked');
    const tracked = button.classList.contains('tracked');
    showToast(tracked ? 'Артист добавлен в отслеживание' : 'Отслеживание отключено');
  });
});

function openNotifications() {
  openSheet(`
    <div class="sheet-title"><h2>Уведомление</h2><button class="close-sheet" aria-label="Закрыть">×</button></div>
    <div class="alert-card" style="margin:4px 0 12px">
      <span class="alert-icon yellow">%</span>
      <span class="alert-copy"><strong>Монеточка</strong><small>Билеты подешевели</small></span>
      <span class="old-price">2 900 ₽</span>
      <span class="new-price">от 2 100 ₽</span>
    </div>
    <div class="setting-row">
      <span class="setting-copy"><strong>Дискотека авария</strong><small>Космонавт · Санкт-Петербург · 14 декабря</small></span>
    </div>
    <button class="sheet-button" id="openPriceConcert">Посмотреть концерт</button>
  `);
  $('#openPriceConcert').addEventListener('click', () => {
    closeSheet();
    setPanel('for-you');
  });
}

$$('.price-trigger').forEach(button => button.addEventListener('click', openNotifications));

function artistSettingsSheet() {
  openSheet(`
    <div class="sheet-title"><h2>Настройки отслеживания</h2><button class="close-sheet" aria-label="Закрыть">×</button></div>
    <div class="setting-row">
      <span class="setting-copy"><strong>Новые концерты</strong><small>Анонсы и новые даты в вашем городе</small></span>
      <button class="switch on" aria-label="Новые концерты"></button>
    </div>
    <div class="setting-row">
      <span class="setting-copy"><strong>Старт продаж</strong><small>Напоминание за час до начала</small></span>
      <button class="switch on" aria-label="Старт продаж"></button>
    </div>
    <div class="setting-row">
      <span class="setting-copy"><strong>Изменение цены</strong><small>При снижении или росте стоимости</small></span>
      <button class="switch on" aria-label="Изменение цены"></button>
    </div>
    <div class="setting-row">
      <span class="setting-copy"><strong>Наличие билетов</strong><small>Если билеты появились или остаются мало</small></span>
      <button class="switch" aria-label="Наличие билетов"></button>
    </div>
    <button class="sheet-button" id="saveSettings">Сохранить настройки</button>
  `);
  $$('.switch', bottomSheet).forEach(sw => sw.addEventListener('click', () => sw.classList.toggle('on')));
  $('#saveSettings')?.addEventListener('click', () => {
    closeSheet();
    showToast('Настройки уведомлений сохранены');
  });
}

function searchArtistSheet() {
  const searchScreen = $('#searchScreen');
  $('#artistSearch').value = '';
  $$('.search-result', $('#searchResults')).forEach(result => {
    result.style.display = 'flex';
  });
  searchScreen.classList.add('open');
  searchScreen.setAttribute('aria-hidden', 'false');
  $('#artistSearch').focus();
}

$('#artistsAdd').addEventListener('click', searchArtistSheet);
$('#emptyAddArtist').addEventListener('click', searchArtistSheet);
$('#searchOpen').addEventListener('click', searchArtistSheet);
$('#navSearch').addEventListener('click', searchArtistSheet);
$('#searchBack').addEventListener('click', () => {
  $('#searchScreen').classList.remove('open');
  $('#searchScreen').setAttribute('aria-hidden', 'true');
});
$('#artistSearch').addEventListener('input', event => {
  const query = event.target.value.toLowerCase();
  $$('.search-result', $('#searchResults')).forEach(result => {
    result.style.display = result.dataset.name.toLowerCase().includes(query) ? 'flex' : 'none';
  });
});
$$('.search-result', $('#searchResults')).forEach(result => result.addEventListener('click', () => openArtistProfile(result.dataset.name)));
$$('[data-tab]').forEach(button => button.addEventListener('click', () => setPanel(button.dataset.tab)));
$('#navConcerts').addEventListener('click', () => setPanel('for-you'));

let followingArtist = null;
const followedArtists = [];
let featuredEvents = [];
let featuredIndex = 0;
const defaultNotifications = {
  newConcerts: true,
  ticketSales: true,
  priceChanges: true,
  ticketAvailability: false
};
const notificationLabels = {
  newConcerts: 'новые концерты',
  ticketSales: 'старт продаж',
  priceChanges: 'изменение цены',
  ticketAvailability: 'наличие билетов'
};

function openArtistProfile(name) {
  followingArtist = name;
  const artistClass = name === 'Монеточка' ? 'avatar-monet' : name === 'Иван Дорн' ? 'avatar-dorn' : name === 'Saluki' ? 'avatar-saluki' : 'avatar-monet';
  const initials = name === 'Монеточка' ? 'М' : name === 'Иван Дорн' ? 'ИД' : name === 'Saluki' ? 'S' : name.slice(0, 2).toUpperCase();
  openSheet(`
    <div class="sheet-title"><h2>Карточка артиста</h2><button class="close-sheet" aria-label="Закрыть">×</button></div>
    <div class="artist-profile">
      <div class="artist-profile-head">
        <span class="avatar ${artistClass}"><span>${initials}</span></span>
        <span class="profile-copy"><strong>${name}</strong><small>2 ближайших концерта</small></span>
      </div>
      <button class="follow-button" id="openFollowSetup">Настроить отслеживание</button>
      <div class="profile-concert-list">
        <div class="profile-concert">
          <div class="poster poster-monet"><span class="poster-label">LIVE</span><span class="poster-date"><small>ДЕК</small><strong>14</strong><em>ПН</em></span></div>
          <span class="profile-concert-info"><strong>${name}</strong><small>Концерт · Санкт-Петербург</small></span>
        </div>
        <div class="profile-concert">
          <div class="poster poster-dorn"><span class="poster-label">LIVE</span><span class="poster-date"><small>ЯНВ</small><strong>24</strong><em>ВС</em></span></div>
          <span class="profile-concert-info"><strong>${name}</strong><small>Open Air · Москва</small></span>
        </div>
      </div>
    </div>
  `);
  $('#openFollowSetup').addEventListener('click', openFollowSetup);
}

function openFollowSetup() {
  const existing = followedArtists.find(artist => artist.name === followingArtist);
  const selectedCities = existing?.settings.cities || ['Москва'];
  const notifications = existing?.settings.notifications || defaultNotifications;
  const cityOptions = ['Москва', 'Санкт-Петербург', 'Казань'];
  const notificationOptions = [
    ['newConcerts', 'Новые концерты', 'Новые даты в выбранных городах'],
    ['ticketSales', 'Старт продаж', 'За час до открытия'],
    ['priceChanges', 'Изменение цены', 'Любое изменение стоимости'],
    ['ticketAvailability', 'Наличие билетов', 'Появление и малый остаток']
  ];
  openSheet(`
    <div class="sheet-title"><h2>Отслеживать артиста</h2><button class="close-sheet" aria-label="Закрыть">×</button></div>
    <div class="setting-row">
      <span class="setting-copy"><strong>Города</strong><small>Выберите, где искать концерты</small></span>
    </div>
    <div class="city-chips" style="display:flex;gap:8px;padding:4px 0 12px">
      ${cityOptions.map(city => `<button class="filter-button${selectedCities.includes(city) ? ' selected-city' : ''}" data-city="${city}" style="${selectedCities.includes(city) ? 'background:var(--yellow);color:#111;border:0' : ''}">${city}</button>`).join('')}
    </div>
    ${notificationOptions.map(([key, title, description]) => `
      <div class="setting-row">
        <span class="setting-copy"><strong>${title}</strong><small>${description}</small></span>
        <button class="switch${notifications[key] ? ' on' : ''}" data-setting="${key}" aria-label="${title}"></button>
      </div>
    `).join('')}
    <button class="sheet-button" id="confirmFollow">Начать отслеживать</button>
  `);
  $$('.city-chips .filter-button', bottomSheet).forEach(button => button.addEventListener('click', () => {
    button.classList.toggle('selected-city');
    button.style.background = button.classList.contains('selected-city') ? 'var(--yellow)' : '';
    button.style.color = button.classList.contains('selected-city') ? '#111' : '';
  }));
  $$('.switch[data-setting]', bottomSheet).forEach(sw => sw.addEventListener('click', () => sw.classList.toggle('on')));
  $('#confirmFollow').addEventListener('click', () => {
    const settings = {
      cities: $$('.city-chips .selected-city', bottomSheet).map(button => button.dataset.city),
      notifications: Object.fromEntries($$('.switch[data-setting]', bottomSheet).map(button => [
        button.dataset.setting,
        button.classList.contains('on')
      ]))
    };
    closeSheet();
    populateArtist(followingArtist || 'Артист', settings);
  });
}

$('#featuredConcert').addEventListener('click', () => {
  const event = featuredEvents[featuredIndex];
  openArtistProfile(event?.artist || 'Монеточка');
});
$('#featuredConcert .featured-pagination').addEventListener('click', event => {
  event.stopPropagation();
  if (!event.target.matches('i')) return;
  featuredIndex = Number(event.target.dataset.index);
  renderFeatured();
});
$('#playerToggle').addEventListener('click', event => {
  const playing = event.currentTarget.textContent === 'Ⅱ';
  event.currentTarget.textContent = playing ? '▶' : 'Ⅱ';
  event.currentTarget.setAttribute('aria-label', playing ? 'Воспроизвести' : 'Пауза');
});

$('#filterButton').addEventListener('click', () => {
  openSheet(`
    <div class="sheet-title"><h2>Фильтры</h2><button class="close-sheet" aria-label="Закрыть">×</button></div>
    <div class="setting-row"><span class="setting-copy"><strong>Только отслеживаемые</strong><small>По артистам из избранного</small></span><button class="switch on"></button></div>
    <div class="setting-row"><span class="setting-copy"><strong>Билеты в наличии</strong><small>Скрыть продажи и ожидание</small></span><button class="switch"></button></div>
    <div class="setting-row"><span class="setting-copy"><strong>До 3 000 ₽</strong><small>По минимальной цене билета</small></span><button class="switch"></button></div>
    <button class="sheet-button" id="applyFilters">Показать 2 концерта</button>
  `);
  $$('.switch', bottomSheet).forEach(sw => sw.addEventListener('click', () => sw.classList.toggle('on')));
  $('#applyFilters').addEventListener('click', () => {
    closeSheet();
    showToast('Фильтры применены');
  });
});

$('#locationButton').addEventListener('click', () => {
  openSheet(`
    <div class="sheet-title"><h2>Город концерта</h2><button class="close-sheet" aria-label="Закрыть">×</button></div>
    <button class="search-result"><strong>Москва</strong><em>Выбрано</em></button>
    <button class="search-result" data-city="Санкт-Петербург"><strong>Санкт-Петербург</strong><em>Выбрать</em></button>
    <button class="search-result" data-city="Казань"><strong>Казань</strong><em>Выбрать</em></button>
  `);
  $$('.search-result', bottomSheet).forEach(row => row.addEventListener('click', () => {
    if (row.dataset.city) {
      $('.city-label').textContent = row.dataset.city;
      closeSheet();
      showToast(`Город: ${row.dataset.city}`);
    }
  }));
});

function populateArtist(name, settings) {
  const existing = followedArtists.find(artist => artist.name === name);
  if (existing) {
    existing.settings = settings;
    showToast(`${name}: настройки обновлены`);
  } else {
    followedArtists.push({ name, settings });
    showToast(`${name} добавлен в отслеживание`);
  }
  renderTracked(name);
  $('#searchScreen').classList.remove('open');
  $('#searchScreen').setAttribute('aria-hidden', 'true');
  setPanel('artists');
}

function renderTracked(featureArtist = null) {
  const list = $('#trackedList');
  list.innerHTML = followedArtists.map(({ name, settings }) => {
    const artistClass = name === 'Монеточка' ? 'avatar-monet' : name === 'Иван Дорн' ? 'avatar-dorn' : name === 'Saluki' ? 'avatar-saluki' : 'avatar-monet';
    const initials = name === 'Монеточка' ? 'М' : name === 'Иван Дорн' ? 'ИД' : name === 'Saluki' ? 'S' : name.slice(0, 2).toUpperCase();
    const enabledNotifications = Object.entries(settings.notifications)
      .filter(([, enabled]) => enabled)
      .map(([key]) => notificationLabels[key]);
    const cities = settings.cities.length ? settings.cities.join(', ') : 'Города не выбраны';
    return `
      <section class="tracked-artist-group" data-artist-group="${name}">
        <div class="tracked-row is-removable" data-name="${name}">
          <span class="avatar ${artistClass}"><span>${initials}</span></span>
          <span class="tracked-copy"><strong>${name}</strong><small>${cities} · ${enabledNotifications.length ? enabledNotifications.join(', ') : 'уведомления выключены'}</small></span>
          <button class="remove-artist" data-remove-artist="${name}" aria-label="Удалить ${name}">×</button>
        </div>
        <div class="populated-concerts">
          <h3>Концерты ${name}</h3>
          <div class="concert-carousel populated-grid">
            <article class="concert-card">
              <div class="poster poster-monet"><span class="poster-label">LIVE</span><span class="poster-date"><small>ДЕК</small><strong>14</strong><em>ПН</em></span></div>
              <div class="concert-info"><div class="concert-title-row"><div><h3>${name}</h3><p>Дискотека авария</p></div></div><p class="venue">Космонавт · Санкт-Петербург</p><div class="concert-footer"><span class="ticket-status selling">Билеты есть</span><strong>от 2 100 ₽</strong></div></div>
            </article>
            <article class="concert-card">
              <div class="poster poster-dorn"><span class="poster-label">LIVE</span><span class="poster-date"><small>ЯНВ</small><strong>24</strong><em>ВС</em></span></div>
              <div class="concert-info"><div class="concert-title-row"><div><h3>${name}</h3><p>Open Air Tour</p></div></div><p class="venue">Zажигай · Москва</p><div class="concert-footer"><span class="ticket-status soon">Старт продаж</span><strong>от 3 500 ₽</strong></div></div>
            </article>
          </div>
        </div>
      </section>
    `;
  }).join('');
  list.style.display = 'block';
  $('#emptyArtists').classList.toggle('visible', followedArtists.length === 0);
  list.style.display = followedArtists.length ? 'block' : 'none';
  $('#artistsCount').textContent = String(followedArtists.length);
  renderFeatured(featureArtist);
  $$('.remove-artist', list).forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    const index = followedArtists.findIndex(artist => artist.name === button.dataset.removeArtist);
    if (index >= 0) followedArtists.splice(index, 1);
    renderTracked();
  }));
  $$('.tracked-row', list).forEach(row => row.addEventListener('click', () => openArtistProfile(row.dataset.name)));
}

function renderFeatured(preferredArtist = null) {
  const fallback = {
    artist: 'Монеточка',
    month: 'ДЕК',
    day: '14',
    weekday: 'ПН',
    eyebrow: 'КОНЦЕРТ НЕДЕЛИ',
    details: '14 декабря · Санкт-Петербург',
    cta: 'Билеты от 2 100 ₽',
    label: 'НОВАЯ ДАТА',
    posterLabel: 'LIVE<br>2026',
    background: ''
  };
  const catalogCards = $$('#concertList .concert-card[data-artist]');
  const artistEvents = followedArtists.flatMap(({ name }) => {
    const cards = catalogCards.filter(card => card.dataset.artist === name);
    if (!cards.length) {
      return [{
        artist: name,
        month: '—',
        day: '—',
        weekday: '—',
        eyebrow: 'ОТСЛЕЖИВАЕМЫЙ АРТИСТ',
        details: 'Новых дат пока нет',
        cta: 'Следим за анонсами',
        label: 'ЖДЁМ АНОНСОВ',
        posterLabel: 'LIVE<br>2026',
        background: '',
        isEmpty: true
      }];
    }
    return cards.map(card => {
      const date = $('.poster-date', card);
      const poster = $('.poster', card);
      const status = $('.ticket-status', card);
      const price = $('.price-trigger', card) || $('.concert-footer strong', card);
      const title = $('.concert-title-row p', card);
      const venue = $('.venue', card);
      return {
        artist: name,
        month: $('small', date)?.textContent || '',
        day: $('strong', date)?.textContent || '',
        weekday: $('em', date)?.textContent || '',
        eyebrow: 'КОНЦЕРТ АРТИСТА',
        details: [title?.textContent, venue?.textContent].filter(Boolean).join(' · '),
        cta: price?.textContent || 'Подробнее',
        label: status?.textContent || 'КОНЦЕРТ',
        posterLabel: $('.poster-label', poster)?.textContent || 'LIVE',
        background: poster ? getComputedStyle(poster).backgroundImage : '',
        isEmpty: false
      };
    });
  });
  featuredEvents = artistEvents.length ? artistEvents : [fallback];
  if (preferredArtist) {
    const preferredIndex = featuredEvents.findIndex(event => event.artist === preferredArtist);
    if (preferredIndex >= 0) featuredIndex = preferredIndex;
  }
  featuredIndex = Math.min(featuredIndex, featuredEvents.length - 1);
  const event = featuredEvents[featuredIndex] || fallback;
  const card = $('#featuredConcert');
  const art = $('.featured-art', card);
  art.style.backgroundImage = event.background || '';
  $('.featured-word', art).innerHTML = event.posterLabel;
  $('.featured-sticker', art).textContent = event.label;
  $('[data-featured="month"]', card).textContent = event.month;
  $('[data-featured="day"]', card).textContent = event.day;
  $('[data-featured="weekday"]', card).textContent = event.weekday;
  $('[data-featured="eyebrow"]', card).textContent = event.eyebrow;
  $('[data-featured="artist"]', card).textContent = event.artist;
  $('[data-featured="details"]', card).textContent = event.details;
  $('[data-featured="cta"]', card).textContent = event.cta;
  card.classList.toggle('featured-empty', Boolean(event.isEmpty));
  const pagination = $('.featured-pagination', card);
  pagination.innerHTML = featuredEvents.map((_, index) =>
    `<i data-index="${index}" class="${index === featuredIndex ? 'selected' : ''}"></i>`
  ).join('');
}

renderTracked();

function renderCalendar() {
  const grid = $('#calendarGrid');
  const days = [30,31,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,1,2];
  grid.innerHTML = days.map((day, index) => {
    const muted = index < 2 || index > 32 ? ' muted' : '';
    const event = day === 14 && index === 16 ? ' event' : '';
    const selected = day === 14 && index === 16 ? ' selected' : '';
    return `<button class="calendar-day${muted}${event}${selected}" data-day="${day}">${day}</button>`;
  }).join('');
  $$('.calendar-day', grid).forEach(day => day.addEventListener('click', () => {
    $$('.calendar-day', grid).forEach(item => item.classList.remove('selected'));
    day.classList.add('selected');
  }));
}
renderCalendar();
