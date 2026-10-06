<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { onContentUpdated, useData, withBase } from 'vitepress';
import { containsPage, headingIsActive, pageLink } from './navigation.mjs';

const { page, theme, site } = useData();
const groups = computed(() => Array.isArray(theme.value.sidebar) ? theme.value.sidebar : []);
const currentLink = computed(() => pageLink(page.value.relativePath));
const panel = ref('documents');
const expanded = ref<string[]>([]);
const headings = ref<{ id: string; text: string; level: number; element: HTMLElement }[]>([]);
const activeHeading = ref('');
const root = ref<HTMLElement>();
let frame = 0;
let focusTimer: ReturnType<typeof setTimeout> | undefined;
let resizeObserver: ResizeObserver | undefined;
let drawerObserver: MutationObserver | undefined;
let sidebar: HTMLElement | null = null;
let media: MediaQueryList | undefined;
let drawerOpen = false;
let leavingPage = false;
let focusArticleOnChange = false;

function focusArticle() {
  const title = document.querySelector<HTMLElement>('.vp-doc h1');
  title?.setAttribute('tabindex', '-1');
  title?.focus({ preventScroll: true });
}

function resetNavigation() {
  panel.value = 'documents';
  expanded.value = groups.value.filter(group => containsPage(group, currentLink.value)).map(group => group.text);
  nextTick(() => {
    const current = root.value?.querySelector<HTMLElement>('a[aria-current="page"]');
    if (sidebar && current) sidebar.scrollTop = Math.max(0, current.offsetTop - sidebar.clientHeight / 3);
    if (focusArticleOnChange) { focusArticleOnChange = false; focusArticle(); }
  });
}
watch([currentLink, groups], resetNavigation, { immediate: true });

function toggleGroup(text: string) {
  expanded.value = expanded.value.includes(text)
    ? expanded.value.filter(item => item !== text) : [...expanded.value, text];
}

function selectTab(next: string, focus = false) {
  panel.value = next;
  if (focus) nextTick(() => root.value?.querySelector<HTMLButtonElement>(`#reading-tab-${next}`)?.focus());
}

function onTabKey(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 'documents' : event.key === 'End' ? 'outline'
    : panel.value === 'documents' ? 'outline' : 'documents';
  selectTab(next, true);
}

function updateActiveHeading() {
  frame = 0;
  // Match the router's anchor offset (134px by default), including rounding.
  const offset = typeof site.value.scrollOffset === 'number' ? site.value.scrollOffset + 8 : 142;
  let active = '';
  for (const heading of headings.value) {
    if (headingIsActive(heading.element.getBoundingClientRect().top, offset)) active = heading.id;
  }
  if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4)
    active = headings.value.at(-1)?.id || '';
  activeHeading.value = active;
}

function scheduleActiveHeading() {
  if (!frame) frame = requestAnimationFrame(updateActiveHeading);
}

async function collectHeadings() {
  await nextTick();
  const article = document.querySelector('.vp-doc');
  headings.value = Array.from(article?.querySelectorAll<HTMLElement>('h2[id], h3[id]') || [])
    .filter(element => !element.classList.contains('ignore-header'))
    .map(element => {
      const label = element.cloneNode(true) as HTMLElement;
      label.querySelectorAll('.header-anchor').forEach(anchor => anchor.remove());
      return { id: element.id, text: (label.textContent || '').replace(/\u200b/g, '').trim(),
        level: Number(element.tagName.slice(1)), element };
    });
  resizeObserver?.disconnect();
  if (article) resizeObserver?.observe(article);
  scheduleActiveHeading();
}
onContentUpdated(collectHeadings);

// Keep VitePress's drawer, backdrop and scroll lock; the slot adds accessible
// tabs/focus handling without creating another menu or another search instance.
function closeDrawer(restoreFocus = true) {
  if (!sidebar?.classList.contains('open')) return;
  leavingPage = !restoreFocus;
  document.querySelector<HTMLElement>('.VPBackdrop')?.click();
}

function followArticle(event: MouseEvent) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  if (sidebar?.classList.contains('open')) {
    const link = event.currentTarget as HTMLAnchorElement;
    if (link.getAttribute('aria-current') === 'page') nextTick(focusArticle);
    else focusArticleOnChange = true;
  }
  closeDrawer(false);
}

function followHeading(event: MouseEvent, id: string) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  closeDrawer(false);
  // Let the normal anchor/router handler preserve history and scrolling.
  requestAnimationFrame(() => {
    const heading = document.getElementById(id);
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
    activeHeading.value = id;
  });
}

function syncDrawer() {
  if (!sidebar || !media) return;
  const mobile = !media.matches;
  const open = mobile && sidebar.classList.contains('open');
  sidebar.toggleAttribute('inert', mobile && !open);
  if (open) {
    sidebar.setAttribute('role', 'dialog');
    sidebar.setAttribute('aria-modal', 'true');
    sidebar.setAttribute('aria-label', '文档导航');
    if (!drawerOpen) {
      clearTimeout(focusTimer);
      // Run after the native drawer's post-flush focus handler. Timers also
      // work in background previews where animation frames can be suspended.
      focusTimer = setTimeout(() => {
        if (sidebar?.classList.contains('open'))
          document.getElementById(`reading-tab-${panel.value}`)?.focus({ preventScroll: true });
      }, 50);
    }
  } else {
    sidebar.removeAttribute('role');
    sidebar.removeAttribute('aria-modal');
    sidebar.removeAttribute('aria-label');
    if (drawerOpen && mobile && !leavingPage)
      document.querySelector<HTMLElement>('.VPLocalNav .menu')?.focus();
  }
  drawerOpen = open;
  leavingPage = false;
}

function onDrawerKey(event: KeyboardEvent) {
  if (!drawerOpen || !sidebar) return;
  if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') || event.key === '/') {
    closeDrawer(false);
    return; // The single native search hotkey handler opens its own dialog.
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    closeDrawer();
  } else if (event.key === 'Tab') {
    const focusable = Array.from(sidebar.querySelectorAll<HTMLElement>('a[href], button, [tabindex="0"]'))
      .filter(element => element.getClientRects().length && !element.closest('[hidden]') && element.tabIndex >= 0);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || !sidebar.contains(document.activeElement))) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !sidebar.contains(document.activeElement))) {
      event.preventDefault(); first?.focus();
    }
  }
}

function onBreakpoint() {
  if (media?.matches) closeDrawer(false);
  syncDrawer();
}

onMounted(() => {
  sidebar = root.value?.closest('.VPSidebar') || null;
  media = window.matchMedia('(min-width: 960px)');
  drawerObserver = new MutationObserver(syncDrawer);
  if (sidebar) drawerObserver.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
  resizeObserver = new ResizeObserver(scheduleActiveHeading);
  media.addEventListener('change', onBreakpoint);
  window.addEventListener('scroll', scheduleActiveHeading, { passive: true });
  window.addEventListener('resize', scheduleActiveHeading);
  document.addEventListener('keydown', onDrawerKey);
  syncDrawer();
  collectHeadings();
});
onUnmounted(() => {
  drawerObserver?.disconnect();
  resizeObserver?.disconnect();
  media?.removeEventListener('change', onBreakpoint);
  window.removeEventListener('scroll', scheduleActiveHeading);
  window.removeEventListener('resize', scheduleActiveHeading);
  document.removeEventListener('keydown', onDrawerKey);
  cancelAnimationFrame(frame);
  clearTimeout(focusTimer);
});
</script>

<template>
  <div ref="root" class="reading-navigation">
    <div class="reading-nav-header">
      <button class="reading-drawer-close" type="button" @click="closeDrawer()">
        <span class="vpi-chevron-left" aria-hidden="true" />关闭导航
      </button>
      <div class="reading-tabs" role="tablist" aria-label="目录类型" @keydown="onTabKey">
        <button v-for="tab in [{ id: 'documents', text: '文档目录' }, { id: 'outline', text: '本页内容' }]"
          :id="`reading-tab-${tab.id}`" :key="tab.id" type="button" role="tab"
          :aria-selected="panel === tab.id" :aria-controls="`reading-panel-${tab.id}`"
          :tabindex="panel === tab.id ? 0 : -1" @click="selectTab(tab.id)">{{ tab.text }}</button>
      </div>
    </div>
    <div id="reading-panel-documents" role="tabpanel" aria-labelledby="reading-tab-documents" :hidden="panel !== 'documents'">
      <section v-for="(group, index) in groups" :key="group.text" class="reading-group">
        <button class="reading-group-title" type="button" :aria-expanded="expanded.includes(group.text)"
          :aria-controls="`reading-group-${index}`" @click="toggleGroup(group.text)">
          <span>{{ group.text }}</span><span class="vpi-chevron-right" aria-hidden="true" />
        </button>
        <ul :id="`reading-group-${index}`" :hidden="!expanded.includes(group.text)">
          <li v-for="item in group.items" :key="item.link">
            <a :href="withBase(item.link)" :aria-current="currentLink === item.link ? 'page' : undefined" @click="followArticle">{{ item.text }}</a>
          </li>
        </ul>
      </section>
    </div>
    <div id="reading-panel-outline" role="tabpanel" aria-labelledby="reading-tab-outline" :hidden="panel !== 'outline'">
      <ul v-if="headings.length" class="reading-outline">
        <li v-for="heading in headings" :key="heading.id" :class="{ 'is-subheading': heading.level === 3 }">
          <a :href="`#${encodeURIComponent(heading.id)}`" :aria-current="activeHeading === heading.id ? 'location' : undefined"
            @click="followHeading($event, heading.id)">{{ heading.text }}</a>
        </li>
      </ul>
      <p v-else class="reading-outline-empty">本页暂无章节</p>
    </div>
  </div>
</template>
