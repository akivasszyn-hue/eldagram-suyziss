/* =====================================================
   TELEGRAM WEB CLONE — LOGIC
   Всё состояние в localStorage, без бэкенда.
   ===================================================== */
(() => {
'use strict';

/* ---------- УТИЛИТЫ ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const AVATAR_COLORS = [
  'linear-gradient(135deg,#e17076,#d05a60)',
  'linear-gradient(135deg,#7bc862,#5fae47)',
  'linear-gradient(135deg,#e5ca77,#d4b45c)',
  'linear-gradient(135deg,#65aadd,#4a8fc4)',
  'linear-gradient(135deg,#a695e7,#8b78d8)',
  'linear-gradient(135deg,#ee7aae,#d95f96)',
  'linear-gradient(135deg,#6ec9cb,#4fadb0)',
  'linear-gradient(135deg,#faa774,#e88a51)'
];
const colorFor = key => {
  let h = 0;
  for (const ch of String(key)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};
const initials = name => String(name).trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';

const pad = n => String(n).padStart(2, '0');
const fmtTime = ts => { const d = new Date(ts); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
const fmtDay = ts => {
  const d = new Date(ts), now = new Date();
  const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86400000);
  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Вчера';
  if (diff < 7) return ['вс','пн','вт','ср','чт','пт','сб'][d.getDay()];
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
};
const fmtListTime = ts => {
  const d = new Date(ts), now = new Date();
  const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86400000);
  if (diff === 0) return fmtTime(ts);
  if (diff === 1) return 'вчера';
  if (diff < 7) return ['вс','пн','вт','ср','чт','пт','сб'][d.getDay()];
  return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + String(d.getFullYear()).slice(2);
};

const linkify = text => esc(text).replace(
  /(https?:\/\/[^\s<]+|www\.[^\s<]+)/g,
  m => `<a class="msg-link" href="${m.startsWith('http') ? m : 'https://' + m}" target="_blank" rel="noopener noreferrer">${m}</a>`
);

/* ---------- ХРАНИЛИЩЕ ---------- */
const KEY = 'tg-web-clone-v1';

const defaultState = () => {
  const now = Date.now(), m = 60000, h = 3600000, d = 86400000;
  return {
    me: {
      first: 'Алексей', last: 'Иванов', bio: 'Работаю над интерфейсами',
      phone: '+996 555 123456', username: '@alexivanov', photo: null
    },
    settings: {
      accent: '#5288c1', night: true, anim: true,
      sound: false, autoReply: true, readReceipts: true, bubbleSize: false
    },
    activeChat: 'saved',
    chats: [
      {
        id: 'saved', name: 'Избранное', type: 'saved', photo: null, unread: 0,
        pinned: true, muted: false, archived: false, online: false, lastSeen: null,
        messages: [
          { id: uid(), out: true, text: 'Ссылка на документацию: [developer.mozilla.org](https://developer.mozilla.org)', ts: now - 2 * d, read: true },
          { id: uid(), out: true, text: 'Не забыть: собрать сборку и залить на GitHub Pages 🚀', ts: now - 5 * h, read: true }
        ]
      },
      {
        id: uid(), name: 'Мария Петрова', type: 'user', photo: null, unread: 2,
        pinned: false, muted: false, archived: false, online: true, lastSeen: null,
        messages: [
          { id: uid(), out: false, text: 'Привет! Ты посмотрел макеты?', ts: now - 3 * h, read: true },
          { id: uid(), out: true, text: 'Привет 👋 Да, всё отлично, только шапку бы поправить.', ts: now - 2.8 * h, read: true },
          { id: uid(), out: false, text: 'Хорошо, поправлю к вечеру.', ts: now - 40 * m, read: false },
          { id: uid(), out: false, text: 'Кинешь потом ссылку на прод?', ts: now - 12 * m, read: false }
        ]
      },
      {
        id: uid(), name: 'Дмитрий Соколов', type: 'user', photo: null, unread: 0,
        pinned: false, muted: true, archived: false, online: false, lastSeen: now - 50 * m,
        messages: [
          { id: uid(), out: false, text: 'Созвон переносим на 15:00, ок?', ts: now - 26 * h, read: true },
          { id: uid(), out: true, text: 'Ок, удобно', ts: now - 25.5 * h, read: true }
        ]
      },
      {
        id: uid(), name: 'Команда Frontend', type: 'group', photo: null, unread: 5,
        pinned: false, muted: false, archived: false, online: false, lastSeen: null, members: 12,
        messages: [
          { id: uid(), out: false, author: 'Игорь', text: 'Задеплоил ветку feature/chat-ui', ts: now - 8 * h, read: true },
          { id: uid(), out: true, text: 'Проверю после обеда', ts: now - 7.5 * h, read: true },
          { id: uid(), out: false, author: 'Ольга', text: 'В мобильной версии сайдбар не скрывается', ts: now - 2 * h, read: false },
          { id: uid(), out: false, author: 'Игорь', text: 'Уже фикшу', ts: now - 95 * m, read: false }
        ]
      },
      {
        id: uid(), name: 'Анна Ким', type: 'user', photo: null, unread: 0,
        pinned: false, muted: false, archived: true, online: false, lastSeen: now - 4 * d,
        messages: [
          { id: uid(), out: false, text: 'Спасибо за помощь!', ts: now - 6 * d, read: true }
        ]
      }
    ],
    contacts: [
      { id: uid(), name: 'Мария Петрова', phone: '+996 555 200100', online: true },
      { id: uid(), name: 'Дмитрий Соколов', phone: '+996 555 200200', online: false },
      { id: uid(), name: 'Игорь Лебедев', phone: '+996 555 200300', online: true },
      { id: uid(), name: 'Ольга Крылова', phone: '+996 555 200400', online: false },
      { id: uid(), name: 'Анна Ким', phone: '+996 555 200500', online: false }
    ]
  };
};

let S;
try {
  const raw = localStorage.getItem(KEY);
  S = raw ? JSON.parse(raw) : defaultState();
  if (!S || !Array.isArray(S.chats)) S = defaultState();
} catch { S = defaultState(); }

let saveTimer = null;
const save = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch { toast('Не удалось сохранить: хранилище переполнено'); }
  }, 120);
};

/* ---------- ССЫЛКИ НА DOM ---------- */
const el = {
  app: $('#app'), sidebar: $('#sidebar'), chatList: $('#chat-list'), search: $('#search-input'),
  header: $('#chat-header'), hAvatar: $('#chat-header-avatar'), hName: $('#chat-header-name'),
  hStatus: $('#chat-header-status'), messages: $('#messages'), empty: $('#empty-state'),
  inputArea: $('#input-area'), composer: $('#composer'), send: $('#send-btn'), mic: $('#mic-btn'),
  emojiBtn: $('#emoji-btn'), picker: $('#emoji-picker'), tabs: $('#emoji-tabs'), grid: $('#emoji-grid'),
  drawer: $('#drawer'), overlay: $('#drawer-overlay'), ctx: $('#context-menu'),
  toast: $('#toast'), modalOverlay: $('#modal-overlay'), modalTitle: $('#modal-title'),
  modalInput: $('#modal-input'), modalInput2: $('#modal-input2'),
  modalOk: $('#modal-ok'), modalCancel: $('#modal-cancel'),
  contactsBody: $('#contacts-body'), chatInfoBody: $('#chat-info-body'),
  colorGrid: $('#color-grid'), filePhoto: $('#file-photo'), fileImport: $('#file-import')
};

/* ---------- TOAST ---------- */
let toastTimer;
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('show'), 2200);
}

/* ---------- MODAL ---------- */
let modalResolve = null;
function modal({ title, value = '', value2 = null, placeholder = '', placeholder2 = '', ok = 'Готово' }) {
  el.modalTitle.textContent = title;
  el.modalInput.value = value;
  el.modalInput.placeholder = placeholder;
  el.modalOk.textContent = ok;
  if (value2 === null) {
    el.modalInput2.hidden = true;
  } else {
    el.modalInput2.hidden = false;
    el.modalInput2.value = value2;
    el.modalInput2.placeholder = placeholder2;
  }
  el.modalOverlay.classList.add('show');
  setTimeout(() => el.modalInput.focus(), 60);
  return new Promise(res => { modalResolve = res; });
}
function closeModal(result) {
  el.modalOverlay.classList.remove('show');
  if (modalResolve) { modalResolve(result); modalResolve = null; }
}
el.modalOk.addEventListener('click', () => closeModal({
  value: el.modalInput.value.trim(),
  value2: el.modalInput2.hidden ? null : el.modalInput2.value.trim()
}));
el.modalCancel.addEventListener('click', () => closeModal(null));
el.modalOverlay.addEventListener('click', e => { if (e.target === el.modalOverlay) closeModal(null); });
[el.modalInput, el.modalInput2].forEach(i => i.addEventListener('keydown', e => {
  if (e.key === 'Enter') el.modalOk.click();
  if (e.key === 'Escape') closeModal(null);
}));

/* ---------- ПОМОЩНИКИ МОДЕЛИ ---------- */
const meName = () => [S.me.first, S.me.last].filter(Boolean).join(' ') || 'Без имени';
const getChat = id => S.chats.find(c => c.id === id);
const lastMsg = c => c.messages[c.messages.length - 1] || null;
const chatOrder = (a, b) => {
  if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
  return (lastMsg(b)?.ts || 0) - (lastMsg(a)?.ts || 0);
};
const statusText = c => {
  if (c.type === 'saved') return 'сохранённые сообщения';
  if (c.type === 'group') return `${c.members || 3} участников`;
  if (c.online) return 'в сети';
  if (!c.lastSeen) return 'был(а) недавно';
  const mins = Math.round((Date.now() - c.lastSeen) / 60000);
  if (mins < 1) return 'был(а) только что';
  if (mins < 60) return `был(а) ${mins} мин назад`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `был(а) ${hrs} ч назад`;
  return `был(а) ${fmtDay(c.lastSeen).toLowerCase()}`;
};

function avatarInner(entity) {
  if (entity.type === 'saved') {
    return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
  }
  if (entity.photo) return `<img src="${entity.photo}" alt="">`;
  return esc(initials(entity.name || ''));
}
const avatarStyle = entity =>
  entity.type === 'saved' || entity.photo ? '' : `background:${colorFor(entity.name || entity.id)};`;

/* ---------- РЕНДЕР СПИСКА ЧАТОВ ---------- */
let filter = '';
let showArchived = false;

function renderChatList() {
  const q = filter.toLowerCase().trim();
  const list = S.chats
    .filter(c => (showArchived ? c.archived : !c.archived))
    .filter(c => {
      if (!q) return true;
      if (c.name.toLowerCase().includes(q)) return true;
      return c.messages.some(m => m.text.toLowerCase().includes(q));
    })
    .sort(chatOrder);

  if (!list.length) {
    el.chatList.innerHTML = `<div style="padding:40px 20px;text-align:center;color:var(--text-muted);font-size:14px">
      ${q ? 'Ничего не найдено' : (showArchived ? 'Архив пуст' : 'Нет чатов')}</div>`;
    return;
  }

  el.chatList.innerHTML = list.map(c => {
    const lm = lastMsg(c);
    const previewRaw = lm
      ? (lm.out ? 'Вы: ' : (c.type === 'group' && lm.author ? lm.author + ': ' : '')) + lm.text
      : 'Нет сообщений';
    const preview = esc(previewRaw.replace(/\s+/g, ' ').slice(0, 120));
    const badge = c.unread ? `<span class="badge">${c.unread > 99 ? '99+' : c.unread}</span>` : '';
    const pin = c.pinned ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="opacity:.6"><path d="M16 3l5 5-3 1-4 4 1 5-2 2-4-5-4 4H4l4-4-5-4 2-2 5 1 4-4z"/></svg>` : '';
    const mute = c.muted ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:.6"><path d="M11 5L6 9H3v6h3l5 4zM17 9l4 6M21 9l-4 6"/></svg>` : '';
    return `<div class="chat-item ${c.id === S.activeChat ? 'active' : ''}" data-id="${c.id}">
      <div class="chat-avatar ${c.type === 'saved' ? 'saved' : ''}" style="${avatarStyle(c)}">${avatarInner(c)}</div>
      <div class="chat-info">
        <div class="chat-row">
          <span class="chat-name">${esc(c.name)}</span>
          <span class="chat-time">${pin}${lm ? fmtListTime(lm.ts) : ''}</span>
        </div>
        <div class="chat-row">
          <span class="chat-preview">${preview}</span>
          <span class="chat-time" style="display:flex;align-items:center;gap:6px">${mute}${badge}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ---------- РЕНДЕР СООБЩЕНИЙ ---------- */
function checkmark(read) {
  return read
    ? `<span class="checkmark read"><svg width="16" height="11" viewBox="0 0 18 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 6.5l3.5 3.5L11 3"/><path d="M8 10l1.2 1.2L17 3"/></svg></span>`
    : `<span class="checkmark"><svg width="12" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 6.5l3.5 3.5L11 3"/></svg></span>`;
}

function renderMessages() {
  const c = getChat(S.activeChat);
  if (!c) {
    el.header.hidden = true; el.inputArea.hidden = true;
    el.messages.innerHTML = '';
    el.messages.appendChild(el.empty);
    el.empty.style.display = '';
    return;
  }
  el.header.hidden = false;
  el.inputArea.hidden = false;
  el.empty.style.display = 'none';

  el.hAvatar.className = 'chat-header-avatar';
  el.hAvatar.setAttribute('style', avatarStyle(c));
  el.hAvatar.innerHTML = avatarInner(c);
  el.hName.textContent = c.name;
  el.hStatus.textContent = typingFor === c.id ? 'печатает...' : statusText(c);

  let html = '', lastDay = '';
  c.messages.forEach((m, i) => {
    const dayKey = new Date(m.ts).toDateString();
    if (dayKey !== lastDay) {
      lastDay = dayKey;
      html += `<div style="align-self:center;margin:14px 0 6px;background:rgba(0,0,0,.28);color:#c3d0dc;
        font-size:12.5px;padding:4px 12px;border-radius:12px;user-select:none">${fmtDay(m.ts)}</div>`;
    }
    const prev = c.messages[i - 1];
    const next = c.messages[i + 1];
    const side = m.out ? 'out' : 'in';
    const firstInGroup = !prev || prev.out !== m.out || new Date(prev.ts).toDateString() !== dayKey;
    const lastInGroup = !next || next.out !== m.out || new Date(next.ts).toDateString() !== dayKey;
    const author = (!m.out && c.type === 'group' && m.author && firstInGroup)
      ? `<div style="font-size:13.5px;font-weight:600;color:${/#/.test('') ? '' : '#7cb3e8'};margin-bottom:2px">${esc(m.author)}</div>` : '';
    const edited = m.edited ? '<span style="opacity:.7">изм. </span>' : '';
    const meta = `<span class="msg-meta">${edited}${fmtTime(m.ts)}${m.out ? checkmark(!!m.read && S.settings.readReceipts) : ''}</span>`;
    html += `<div class="msg-row ${side} ${firstInGroup ? 'first-in-group' : ''}">
      <div class="msg ${side} ${lastInGroup ? 'tail-' + side : ''}" data-id="${m.id}">
        ${author}<span class="msg-text">${linkify(m.text)}</span>${meta}
      </div>
    </div>`;
  });

  el.messages.innerHTML = html;
  el.messages.appendChild(el.empty);
  requestAnimationFrame(() => { el.messages.scrollTop = el.messages.scrollHeight; });
}

/* ---------- ОТКРЫТИЕ ЧАТА ---------- */
function openChat(id) {
  const c = getChat(id);
  if (!c) return;
  S.activeChat = id;
  c.unread = 0;
  if (window.matchMedia('(max-width: 768px)').matches) el.sidebar.classList.add('hidden');
  renderChatList(); renderMessages();
  el.composer.focus({ preventScroll: true });
  save();
}

el.chatList.addEventListener('click', e => {
  const item = e.target.closest('.chat-item');
  if (item) openChat(item.dataset.id);
});
$('#back-btn').addEventListener('click', () => el.sidebar.classList.remove('hidden'));

/* ---------- ПОИСК ---------- */
el.search.addEventListener('input', () => { filter = el.search.value; renderChatList(); });
el.search.addEventListener('keydown', e => {
  if (e.key === 'Escape') { el.search.value = ''; filter = ''; renderChatList(); el.search.blur(); }
});

/* ---------- ОТПРАВКА ---------- */
let typingFor = null;

function autoGrow() {
  el.composer.style.height = 'auto';
  el.composer.style.height = Math.min(el.composer.scrollHeight, 200) + 'px';
  const has = el.composer.value.trim().length > 0;
  el.send.classList.toggle('hidden', !has);
  el.mic.style.display = has ? 'none' : '';
}
el.composer.addEventListener('input', autoGrow);
el.composer.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

function beep() {
  if (!S.settings.sound) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx(), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 880;
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 400);
  } catch {}
}

const REPLIES = [
  'Понял, спасибо!', 'Хорошо 👍', 'Давай обсудим позже', 'Сейчас посмотрю',
  'Отлично получилось!', 'А можно чуть подробнее?', 'Согласен', 'Уже в работе 🙂',
  'Окей, жду', 'Супер, беру в спринт'
];

function sendMessage() {
  const text = el.composer.value.replace(/\s+$/, '');
  const c = getChat(S.activeChat);
  if (!text.trim() || !c) return;

  c.messages.push({ id: uid(), out: true, text, ts: Date.now(), read: false });
  el.composer.value = '';
  autoGrow();
  beep();
  renderChatList(); renderMessages();
  save();

  const msg = lastMsg(c);
  setTimeout(() => { if (msg) { msg.read = true; renderMessages(); save(); } }, 1400);

  if (S.settings.autoReply && c.type !== 'saved') {
    const chatId = c.id;
    setTimeout(() => {
      typingFor = chatId;
      if (S.activeChat === chatId) renderMessages();
      setTimeout(() => {
        const ch = getChat(chatId);
        typingFor = null;
        if (!ch) return;
        ch.messages.push({
          id: uid(), out: false,
          author: ch.type === 'group' ? 'Игорь' : undefined,
          text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
          ts: Date.now(), read: S.activeChat === chatId
        });
        if (S.activeChat !== chatId) ch.unread = (ch.unread || 0) + 1;
        renderChatList();
        if (S.activeChat === chatId) renderMessages();
        save();
      }, 1200 + Math.random() * 1200);
    }, 700);
  }
}
el.send.addEventListener('click', sendMessage);
el.mic.addEventListener('click', () => toast('Запись голосовых в этой сборке недоступна'));
$('#attach-btn').addEventListener('click', () => toast('Вложения: перетащите файл в окно чата'));
$('#btn-call').addEventListener('click', () => toast('Звонки недоступны в веб-клоне'));
$('#btn-chat-search').addEventListener('click', () => { el.search.focus(); el.search.select(); });

/* ---------- EMOJI PICKER ---------- */
const EMOJI = {
  '😀': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😋','😜','🤪','😝','🤗','🤔','🤨','😐','😑','😶','🙄','😏','😴','🥳','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😢','😭','😤','😠','😡','🤯','😱','🥶','🥵','🤢','🤮','🤧','😷','🤒','🤕'],
  '👍': ['👍','👎','👌','✌️','🤞','🤟','🤘','👏','🙌','👐','🤲','🙏','💪','🦾','✍️','💅','👋','🤚','🖐️','✋','🖖','👊','✊','🤛','🤜','👆','👇','👉','👈','☝️','🫶','🤝'],
  '❤️': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','✨','⭐','🌟','💫','🔥','💥','💯','🎉','🎊','🎈','🎁'],
  '🐶': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐢','🐍','🐙','🦀','🐳','🐬','🐟','🦈'],
  '🍎': ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🥑','🍆','🥔','🥕','🌽','🌶️','🥒','🥦','🧄','🧅','🍞','🥐','🥨','🧇','🧀','🍕','🍔','🌮','🍣','🍜','🍰','🍩','☕','🍺'],
  '⚽': ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🥊','🥋','⛳','🏆','🥇','🥈','🥉','🎯','🎮','🕹️','🎲','🎸','🎹','🎺','🎻','🥁','🎤','🎧','🎬','🎨'],
  '🚗': ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚚','🚜','🛴','🚲','🛵','🏍️','✈️','🚀','🛸','🚁','⛵','🚢','🗺️','🏔️','🏕️','🏖️','🌋','🏝️','🌆','🌉','🗼'],
  '💻': ['💻','🖥️','⌨️','🖱️','📱','☎️','📞','📟','📠','🔋','💡','🔌','💾','💿','📀','🎥','📷','📹','📺','⏰','⌚','📡','🔍','🔑','🔒','📌','📎','✂️','📝','📅','📈','📊','🗂️','📁','🗑️']
};
function buildEmoji() {
  const cats = Object.keys(EMOJI);
  el.tabs.innerHTML = cats.map((c, i) =>
    `<div class="emoji-tab ${i === 0 ? 'active' : ''}" data-cat="${c}">${c}</div>`).join('');
  fillEmoji(cats[0]);
}
function fillEmoji(cat) {
  el.grid.innerHTML = EMOJI[cat].map(e => `<div class="emoji-item">${e}</div>`).join('');
}
el.tabs.addEventListener('click', e => {
  const t = e.target.closest('.emoji-tab');
  if (!t) return;
  $$('.emoji-tab', el.tabs).forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  fillEmoji(t.dataset.cat);
});
el.grid.addEventListener('click', e => {
  const it = e.target.closest('.emoji-item');
  if (!it) return;
  const ta = el.composer, pos = ta.selectionStart ?? ta.value.length;
  ta.value = ta.value.slice(0, pos) + it.textContent + ta.value.slice(ta.selectionEnd ?? pos);
  ta.selectionStart = ta.selectionEnd = pos + it.textContent.length;
  ta.focus(); autoGrow();
});
el.emojiBtn.addEventListener('click', e => { e.stopPropagation(); el.picker.classList.toggle('show'); });
document.addEventListener('click', e => {
  if (!el.picker.contains(e.target) && !el.emojiBtn.contains(e.target)) el.picker.classList.remove('show');
});

/* ---------- КОНТЕКСТНОЕ МЕНЮ ---------- */
const ICON = {
  copy: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
  edit: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  reply: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17l-5-5 5-5"/><path d="M4 12h11a5 5 0 0 1 5 5v3"/></svg>',
  pin: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3l5 5-3 1-4 4 1 5-2 2-4-5-4 4H4l4-4-5-4 2-2 5 1 4-4z"/></svg>',
  mute: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 5L6 9H3v6h3l5 4zM17 9l4 6M21 9l-4 6"/></svg>',
  archive: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/></svg>',
  info: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>',
  clear: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
  read: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12l5 5L14 7M12 16l1.5 1.5L23 8"/></svg>'
};

function showCtx(x, y, items) {
  el.ctx.innerHTML = items.map((it, i) =>
    `<div class="ctx-item ${it.danger ? 'danger' : ''}" data-i="${i}">${it.icon || ''}<span>${esc(it.label)}</span></div>`).join('');
  el.ctx.classList.add('show');
  const r = el.ctx.getBoundingClientRect();
  el.ctx.style.left = clamp(x, 6, innerWidth - r.width - 6) + 'px';
  el.ctx.style.top = clamp(y, 6, innerHeight - r.height - 6) + 'px';
  el.ctx.onclick = e => {
    const t = e.target.closest('.ctx-item');
    if (!t) return;
    hideCtx();
    items[+t.dataset.i].run?.();
  };
}
function hideCtx() { el.ctx.classList.remove('show'); el.ctx.onclick = null; }
document.addEventListener('click', e => { if (!el.ctx.contains(e.target)) hideCtx(); });
window.addEventListener('scroll', hideCtx, true);
window.addEventListener('resize', hideCtx);

/* контекст на сообщении */
el.messages.addEventListener('contextmenu', e => {
  const node = e.target.closest('.msg');
  if (!node) return;
  e.preventDefault();
  const c = getChat(S.activeChat);
  const m = c?.messages.find(x => x.id === node.dataset.id);
  if (!m) return;
  const items = [
    { label: 'Копировать', icon: ICON.copy, run: async () => {
        try { await navigator.clipboard.writeText(m.text); toast('Скопировано'); }
        catch { toast('Копирование недоступно'); } } },
    { label: 'Ответить', icon: ICON.reply, run: () => {
        el.composer.value = m.text.split('\n').map(l => '> ' + l).join('\n') + '\n';
        el.composer.focus(); autoGrow(); } }
  ];
  if (m.out) items.push({ label: 'Изменить', icon: ICON.edit, run: async () => {
      const r = await modal({ title: 'Изменить сообщение', value: m.text, ok: 'Сохранить' });
      if (r && r.value) { m.text = r.value; m.edited = true; renderMessages(); renderChatList(); save(); }
    } });
  items.push({ label: 'Удалить', icon: ICON.clear, danger: true, run: () => {
      c.messages = c.messages.filter(x => x.id !== m.id);
      renderMessages(); renderChatList(); save(); toast('Сообщение удалено');
    } });
  showCtx(e.clientX, e.clientY, items);
});

/* контекст на чате */
el.chatList.addEventListener('contextmenu', e => {
  const item = e.target.closest('.chat-item');
  if (!item) return;
  e.preventDefault();
  const c = getChat(item.dataset.id);
  if (!c) return;
  const items = [
    { label: c.pinned ? 'Открепить' : 'Закрепить', icon: ICON.pin, run: () => { c.pinned = !c.pinned; renderChatList(); save(); } },
    { label: c.muted ? 'Включить звук' : 'Отключить звук', icon: ICON.mute, run: () => { c.muted = !c.muted; renderChatList(); save(); } },
    { label: c.unread ? 'Отметить прочитанным' : 'Отметить непрочитанным', icon: ICON.read, run: () => { c.unread = c.unread ? 0 : 1; renderChatList(); save(); } },
    { label: 'Информация', icon: ICON.info, run: () => openChatInfo(c.id) }
  ];
  if (c.type !== 'saved') {
    items.push({ label: c.archived ? 'Вернуть из архива' : 'В архив', icon: ICON.archive, run: () => {
        c.archived = !c.archived; renderChatList(); save(); toast(c.archived ? 'Чат в архиве' : 'Чат возвращён');
      } });
  }
  items.push({ label: 'Очистить историю', icon: ICON.clear, danger: true, run: () => {
      c.messages = []; renderChatList(); if (S.activeChat === c.id) renderMessages(); save(); toast('История очищена');
    } });
  if (c.type !== 'saved') {
    items.push({ label: 'Удалить чат', icon: ICON.clear, danger: true, run: () => {
        S.chats = S.chats.filter(x => x.id !== c.id);
        if (S.activeChat === c.id) S.activeChat = S.chats[0]?.id || null;
        renderChatList(); renderMessages(); save(); toast('Чат удалён');
      } });
  }
  showCtx(e.clientX, e.clientY, items);
});

/* меню в шапке чата */
$('#btn-chat-menu').addEventListener('click', e => {
  e.stopPropagation();
  const c = getChat(S.activeChat);
  if (!c) return;
  const r = e.currentTarget.getBoundingClientRect();
  showCtx(r.left - 150, r.bottom + 6, [
    { label: 'Информация', icon: ICON.info, run: () => openChatInfo(c.id) },
    { label: c.muted ? 'Включить звук' : 'Отключить звук', icon: ICON.mute, run: () => { c.muted = !c.muted; renderChatList(); save(); } },
    { label: c.pinned ? 'Открепить' : 'Закрепить', icon: ICON.pin, run: () => { c.pinned = !c.pinned; renderChatList(); save(); } },
    { label: 'Очистить историю', icon: ICON.clear, danger: true, run: () => {
        c.messages = []; renderMessages(); renderChatList(); save(); toast('История очищена'); } }
  ]);
});
el.header.addEventListener('click', e => {
  if (e.target.closest('.header-actions') || e.target.closest('.back-btn')) return;
  openChatInfo(S.activeChat);
});

/* ---------- DRAWER ---------- */
function openDrawer() {
  $('#drawer-name').textContent = meName();
  $('#drawer-phone').textContent = S.me.phone || 'Телефон не указан';
  $('#drawer-username').textContent = S.me.username || '';
  const av = $('#drawer-avatar');
  av.setAttribute('style', S.me.photo ? '' : `background:${colorFor(meName())};`);
  av.innerHTML = S.me.photo ? `<img src="${S.me.photo}" alt="">` : esc(initials(meName()));
  $('#contacts-count').textContent = S.contacts.length;
  $('#archive-count').textContent = S.chats.filter(c => c.archived).length || '';
  el.drawer.classList.add('show');
  el.overlay.classList.add('show');
}
function closeDrawer() { el.drawer.classList.remove('show'); el.overlay.classList.remove('show'); }
$('#burger').addEventListener('click', openDrawer);
el.overlay.addEventListener('click', closeDrawer);

$('#drawer-profile').addEventListener('click', () => { closeDrawer(); openPanel('panel-profile'); });

el.drawer.addEventListener('click', async e => {
  const item = e.target.closest('.drawer-item');
  if (!item) return;
  const a = item.dataset.action;

  if (a === 'night' || a === 'animations') {
    const sw = $('.switch', item);
    sw.classList.toggle('on');
    const on = sw.classList.contains('on');
    if (a === 'night') {
      S.settings.night = on;
      document.documentElement.classList.toggle('light-mode', !on);
      applyTheme();
      toast(on ? 'Ночной режим включён' : 'Светлый режим включён');
    } else {
      S.settings.anim = on;
      applyTheme();
      toast(on ? 'Анимации включены' : 'Анимации отключены');
    }
    save();
    return;
  }

  if (a === 'new-group') {
    const r = await modal({ title: 'Новая группа', placeholder: 'Название группы', value: '', ok: 'Создать' });
    if (r && r.value) {
      const chat = { id: uid(), name: r.value, type: 'group', photo: null, unread: 0, pinned: false,
        muted: false, archived: false, online: false, lastSeen: null, members: 1, messages: [] };
      S.chats.push(chat); closeDrawer(); showArchived = false; openChat(chat.id); save();
      toast('Группа создана');
    }
    return;
  }

  if (a === 'contacts') { closeDrawer(); renderContacts(); openPanel('panel-contacts'); return; }
  if (a === 'saved')    { closeDrawer(); showArchived = false; openChat('saved'); return; }
  if (a === 'archive')  { closeDrawer(); showArchived = !showArchived; renderChatList();
                          toast(showArchived ? 'Показан архив' : 'Показаны все чаты'); return; }
  if (a === 'settings') { closeDrawer(); openPanel('panel-settings'); return; }
  if (a === 'help')     { closeDrawer(); toast('Ctrl+K — поиск · Enter — отправить · ПКМ — меню'); return; }

  if (a === 'reset') {
    const r = await modal({ title: 'Удалить все данные?', value: '', placeholder: 'Введите УДАЛИТЬ', ok: 'Удалить' });
    if (r && r.value.toUpperCase() === 'УДАЛИТЬ') {
      localStorage.removeItem(KEY);
      location.reload();
    } else if (r) toast('Отменено');
  }
});

/* ---------- PANELS ---------- */
function openPanel(id) {
  $$('.panel').forEach(p => p.classList.remove('show'));
  const p = $('#' + id);
  if (!p) return;
  if (id === 'panel-profile') fillProfile();
  if (id === 'panel-settings') fillSettings();
  p.classList.add('show');
}
function closePanels() { $$('.panel').forEach(p => p.classList.remove('show')); }
$$('.panel-close').forEach(b => b.addEventListener('click', closePanels));

/* ----- профиль ----- */
function fillProfile() {
  $('#f-first').value = S.me.first || '';
  $('#f-last').value = S.me.last || '';
  $('#f-bio').value = S.me.bio || '';
  $('#f-phone').value = S.me.phone || '';
  $('#f-username').value = S.me.username || '';
  $('#profile-name-view').textContent = meName();
  const a = $('#profile-big-avatar');
  a.setAttribute('style', S.me.photo ? '' : `background:${colorFor(meName())};`);
  a.innerHTML = S.me.photo ? `<img src="${S.me.photo}" alt="">` : esc(initials(meName()));
}
$('#profile-save').addEventListener('click', () => {
  S.me.first = $('#f-first').value.trim();
  S.me.last = $('#f-last').value.trim();
  S.me.bio = $('#f-bio').value.trim();
  S.me.phone = $('#f-phone').value.trim();
  let u = $('#f-username').value.trim();
  if (u && !u.startsWith('@')) u = '@' + u;
  S.me.username = u;
  save(); fillProfile(); toast('Профиль сохранён');
});
$('#profile-open-saved').addEventListener('click', () => { closePanels(); openChat('saved'); });
$('#profile-copy-link').addEventListener('click', async () => {
  const link = '[t.me](https://t.me/)' + (S.me.username || '').replace('@', '');
  try { await navigator.clipboard.writeText(link); toast('Ссылка скопирована'); }
  catch { toast(link); }
});
$('#profile-big-avatar').addEventListener('click', () => el.filePhoto.click());
$('#pick-photo').addEventListener('click', () => el.filePhoto.click());
$('#drop-photo').addEventListener('click', () => {
  S.me.photo = null; save(); fillProfile(); renderChatList(); toast('Фото удалено');
});
el.filePhoto.addEventListener('change', () => {
  const f = el.filePhoto.files?.[0];
  if (!f) return;
  if (f.size > 1.5 * 1024 * 1024) { toast('Файл больше 1.5 МБ — выберите меньше'); el.filePhoto.value = ''; return; }
  const fr = new FileReader();
  fr.onload = () => { S.me.photo = fr.result; save(); fillProfile(); toast('Фото обновлено'); };
  fr.readAsDataURL(f);
  el.filePhoto.value = '';
});

/* ----- настройки ----- */
const ACCENTS = ['#5288c1','#7bc862','#e17076','#a695e7','#faa774','#6ec9cb','#ee7aae','#e5ca77'];
function fillSettings() {
  el.colorGrid.innerHTML = ACCENTS.map(c =>
    `<div class="color-dot ${c === S.settings.accent ? 'active' : ''}" data-c="${c}" style="background:${c}"></div>`).join('');
  $$('[data-switch]').forEach(sw => sw.classList.toggle('on', !!S.settings[sw.dataset.switch]));
}
el.colorGrid.addEventListener('click', e => {
  const d = e.target.closest('.color-dot');
  if (!d) return;
  S.settings.accent = d.dataset.c;
  applyTheme(); fillSettings(); save(); toast('Цвет изменён');
});
$('#panel-settings').addEventListener('click', e => {
  const row = e.target.closest('[data-toggle]');
  if (!row) return;
  const key = row.dataset.toggle;
  S.settings[key] = !S.settings[key];
  $('[data-switch]', row)?.classList.toggle('on', S.settings[key]);
  applyTheme(); save(); renderMessages();
});
$('#export-data').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'telegram-clone-backup.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Файл сохранён');
});
$('#import-data').addEventListener('click', () => el.fileImport.click());
el.fileImport.addEventListener('change', () => {
  const f = el.fileImport.files?.[0];
  if (!f) return;
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const data = JSON.parse(fr.result);
      if (!data || !Array.isArray(data.chats)) throw new Error('bad');
      S = data;
      save(); applyTheme(); renderChatList(); renderMessages(); closePanels(); toast('Данные загружены');
    } catch { toast('Неверный файл'); }
  };
  fr.readAsText(f);
  el.fileImport.value = '';
});

/* ----- контакты ----- */
function renderContacts() {
  const list = [...S.contacts].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  el.contactsBody.innerHTML = `<div class="section-title">${list.length} контактов</div>` + (list.length
    ? list.map(c => `<div class="contact-item" data-id="${c.id}">
        <div class="contact-avatar" style="background:${colorFor(c.name)}">${esc(initials(c.name))}</div>
        <div class="contact-info">
          <div class="contact-name">${esc(c.name)}</div>
          <div class="contact-status ${c.online ? 'online' : ''}">${c.online ? 'в сети' : esc(c.phone)}</div>
        </div>
      </div>`).join('')
    : `<div style="padding:30px;text-align:center;color:var(--text-muted)">Список пуст</div>`);
}
el.contactsBody.addEventListener('click', e => {
  const it = e.target.closest('.contact-item');
  if (!it) return;
  const c = S.contacts.find(x => x.id === it.dataset.id);
  if (!c) return;
  let chat = S.chats.find(x => x.name === c.name && x.type === 'user');
  if (!chat) {
    chat = { id: uid(), name: c.name, type: 'user', photo: null, unread: 0, pinned: false,
      muted: false, archived: false, online: c.online, lastSeen: Date.now() - 3600000, messages: [] };
    S.chats.push(chat);
  }
  chat.archived = false;
  closePanels(); showArchived = false; openChat(chat.id); save();
});
$('#add-contact').addEventListener('click', async () => {
  const r = await modal({ title: 'Новый контакт', value: '', value2: '',
    placeholder: 'Имя и фамилия', placeholder2: 'Телефон', ok: 'Добавить' });
  if (r && r.value) {
    S.contacts.push({ id: uid(), name: r.value, phone: r.value2 || '—', online: false });
    renderContacts(); save(); toast('Контакт добавлен');
  }
});

/* ----- информация о чате ----- */
function openChatInfo(id) {
  const c = getChat(id);
  if (!c) return;
  const msgs = c.messages.length;
  const mine = c.messages.filter(m => m.out).length;
  const links = c.messages.filter(m => /https?:\/\/|www\./i.test(m.text)).length;
  el.chatInfoBody.innerHTML = `
    <div class="profile-hero">
      <div class="profile-big-avatar" style="${avatarStyle(c)}">${avatarInner(c)}</div>
      <div class="profile-name">${esc(c.name)}</div>
      <div class="profile-status ${c.online ? '' : 'offline'}">${esc(statusText(c))}</div>
      <div class="profile-buttons">
        <button class="profile-btn primary" data-ci="open">Открыть чат</button>
        <button class="profile-btn" data-ci="mute">${c.muted ? 'Включить звук' : 'Отключить звук'}</button>
      </div>
    </div>
    <div class="section-title">Сведения</div>
    <div class="panel-item" style="cursor:default">
      ${ICON.info}
      <div class="panel-item-info">
        <div class="panel-item-label">${c.type === 'group' ? 'Группа' : c.type === 'saved' ? 'Личное хранилище' : 'Личный чат'}</div>
        <div class="panel-item-sub">${msgs} сообщений · ваших ${mine} · ссылок ${links}</div>
      </div>
    </div>
    <div class="panel-divider"></div>
    <div class="panel-item" style="cursor:default">
      ${ICON.pin}
      <div class="panel-item-info">
        <div class="panel-item-label">${c.pinned ? 'Закреплён' : 'Не закреплён'}</div>
        <div class="panel-item-sub">${c.archived ? 'В архиве' : 'В основном списке'}</div>
      </div>
    </div>
    <div class="section-title">Действия</div>
    <div class="panel-item" data-ci="clear">
      ${ICON.clear}
      <div class="panel-item-info"><div class="panel-item-label">Очистить историю</div></div>
    </div>`;
  el.chatInfoBody.onclick = ev => {
    const b = ev.target.closest('[data-ci]');
    if (!b) return;
    const act = b.dataset.ci;
    if (act === 'open') { closePanels(); openChat(c.id); }
    if (act === 'mute') { c.muted = !c.muted; renderChatList(); save(); openChatInfo(c.id); }
    if (act === 'clear') { c.messages = []; renderChatList(); renderMessages(); save(); closePanels(); toast('История очищена'); }
  };
  openPanel('panel-chat-info');
}

/* ---------- ТЕМА ---------- */
const STYLE_ID = 'dynamic-theme';
function applyTheme() {
  const s = S.settings;
  const root = document.documentElement;
  root.style.setProperty('--accent', s.accent);
  root.style.setProperty('--accent-hover', lighten(s.accent, 0.18));
  root.style.setProperty('--bg-active', mix(s.accent, '#1c2733', 0.55));
  root.style.setProperty('--bg-message-out', mix(s.accent, '#1c2733', 0.6));

  let tag = document.getElementById(STYLE_ID);
  if (!tag) { tag = document.createElement('style'); tag.id = STYLE_ID; document.head.appendChild(tag); }
  tag.textContent = `
    ${s.anim ? '' : '*,*::before,*::after{animation:none!important;transition:none!important}'}
    ${s.bubbleSize ? '.msg{font-size:16.5px}.msg-meta{font-size:12.5px}' : ''}
    ${s.night ? '' : `
      :root{--bg-primary:#fff;--bg-sidebar:#fff;--bg-header:#fff;--bg-chat:#e6ebee;
        --bg-hover:#f1f3f5;--bg-context:#fff;--bg-drawer:#fff;--bg-panel:#fff;--bg-input:#fff;
        --bg-message-in:#fff;--text-primary:#111;--text-secondary:#707579;--text-muted:#8d969c;
        --divider:#dfe1e5;--border:#dfe1e5;--scrollbar:#c4c9cc}
      html,body{background:#e6ebee}
      .search-box{background:#f1f3f5}
      .modal-input{background:#f1f3f5}
      .msg.in .msg-meta{color:#8d969c}
      .drawer-profile{background:linear-gradient(135deg,#f7f9fb,#fff)}
      .profile-hero{background:linear-gradient(180deg,#f7f9fb 0%,#fff 100%)}
      .msg-link{color:#2481cc}
    `}
  `;
}
function hex2rgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
const rgb2hex = a => '#' + a.map(v => pad(clamp(Math.round(v),0,255).toString(16))).join('');
const lighten = (hex, k) => rgb2hex(hex2rgb(hex).map(v => v + (255 - v) * k));
const mix = (a, b, k) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A.map((v,i) => v*k + B[i]*(1-k))); };

/* ---------- DRAG & DROP КАРТИНОК В ЧАТ ---------- */
['dragover','drop'].forEach(t => el.messages.addEventListener(t, e => e.preventDefault()));
el.messages.addEventListener('drop', e => {
  const f = e.dataTransfer?.files?.[0];
  const c = getChat(S.activeChat);
  if (!f || !c) return;
  c.messages.push({ id: uid(), out: true, text: `📎 ${f.name} · ${(f.size/1024).toFixed(0)} КБ`, ts: Date.now(), read: false });
  renderChatList(); renderMessages(); save();
});

/* ---------- ГОРЯЧИЕ КЛАВИШИ ---------- */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault(); el.search.focus(); el.search.select();
  }
  if (e.key === 'Escape') {
    if (el.modalOverlay.classList.contains('show')) return closeModal(null);
    if ($$('.panel.show').length) return closePanels();
    if (el.drawer.classList.contains('show')) return closeDrawer();
    if (el.picker.classList.contains('show')) return el.picker.classList.remove('show');
    hideCtx();
  }
});

/* ---------- ИНИЦИАЛИЗАЦИЯ ---------- */
function init() {
  applyTheme();
  buildEmoji();
  renderChatList();
  if (!getChat(S.activeChat)) S.activeChat = S.chats.sort(chatOrder)[0]?.id || null;
  renderMessages();
  autoGrow();
  el.modalInput2.hidden = true;
  if (window.matchMedia('(max-width: 768px)').matches) el.sidebar.classList.remove('hidden');
  window.addEventListener('beforeunload', () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} });
}
init();
})();
