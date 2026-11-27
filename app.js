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
  openSheet(`
    <div class="sheet-title"><h2>Отслеживать артиста</h2><button class="close-sheet" aria-label="Закрыть">×</button></div>
    <div class="setting-row">
      <span class="setting-copy"><strong>Города</strong><small>Выберите, где искать концерты</small></span>
    </div>
    <div class="city-chips" style="display:flex;gap:8px;padding:4px 0 12px">
      <button class="filter-button selected-city" style="background:var(--yellow);color:#111;border:0">Москва</button>
      <button class="filter-button">Санкт-Петербург</button>
      <button class="filter-button">Казань</button>
    </div>
    <div class="setting-row">
      <span class="setting-copy"><strong>Новые концерты</strong><small>Новые даты в выбранных городах</small></span><button class="switch on"></button>
    </div>
    <div class="setting-row">
      <span class="setting-copy"><strong>Старт продаж</strong><small>За час до открытия</small></span><button class="switch on"></button>
    </div>
    <div class="setting-row">
      <span class="setting-copy"><strong>Изменение цены</strong><small>Любое изменение стоимости</small></span><button class="switch on"></button>
    </div>
    <div class="setting-row">
      <span class="setting-copy"><strong>Наличие билетов</strong><small>Появление и малый остаток</small></span><button class="switch"></button>
    </div>
    <button class="sheet-button" id="confirmFollow">Начать отслеживать</button>
  `);
  $$('.filter-button', bottomSheet).forEach(button => button.addEventListener('click', () => {
    button.classList.toggle('selected-city');
    button.style.background = button.classList.contains('selected-city') ? 'var(--yellow)' : '';
    button.style.color = button.classList.contains('selected-city') ? '#111' : '';
  }));
  $$('.switch', bottomSheet).forEach(sw => sw.addEventListener('click', () => sw.classList.toggle('on')));
  $('#confirmFollow').addEventListener('click', () => {
    closeSheet();
    populateArtist(followingArtist || 'Артист');
  });
}

$$('.recommend-follow[data-artist]').forEach(card => card.addEventListener('click', () => openArtistProfile(card.dataset.artist)));

$('#featuredConcert').addEventListener('click', () => openArtistProfile('Монеточка'));
$('#featuredConcert .featured-pagination').addEventListener('click', event => {
  event.stopPropagation();
  if (event.target.matches('i')) {
    $$('#featuredConcert .featured-pagination i').forEach(dot => dot.classList.toggle('selected', dot === event.target));
  }
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

function populateArtist(name) {
  const list = $('#trackedList');
  const artistClass = name === 'Монеточка' ? 'avatar-monet' : name === 'Иван Дорн' ? 'avatar-dorn' : name === 'Saluki' ? 'avatar-saluki' : 'avatar-monet';
  const initials = name === 'Монеточка' ? 'М' : name === 'Иван Дорн' ? 'ИД' : name === 'Saluki' ? 'S' : name.slice(0, 2).toUpperCase();
  list.innerHTML = `
    <div class="tracked-row is-removable" data-name="${name}">
      <span class="avatar ${artistClass}"><span>${initials}</span></span>
      <span class="tracked-copy"><strong>${name}</strong><small>Все уведомления включены</small></span>
      <button class="remove-artist" aria-label="Удалить ${name}">×</button>
    </div>
  `;
  list.insertAdjacentHTML('beforeend', `
    <div class="populated-concerts">
      <h3>Ближайшие концерты</h3>
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
  `);
  list.style.display = 'block';
  $('#emptyArtists').classList.remove('visible');
  $('#artistsCount').textContent = '1';
  showToast(`${name} добавлен в отслеживание`);
  $('#searchScreen').classList.remove('open');
  $('#searchScreen').setAttribute('aria-hidden', 'true');
  setPanel('artists');
  $$('.remove-artist', list).forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    showEmptyArtists();
  }));
  $$('.tracked-row', list).forEach(row => row.addEventListener('click', () => openArtistProfile(row.dataset.name)));
}

function showEmptyArtists() {
  $('#trackedList').innerHTML = '';
  $('#trackedList').style.display = 'none';
  $('#emptyArtists').classList.add('visible');
  $('#artistsCount').textContent = '0';
  followingArtist = null;
}

showEmptyArtists();

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
