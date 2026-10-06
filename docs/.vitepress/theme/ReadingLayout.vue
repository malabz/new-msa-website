<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { computed } from 'vue';
import { useData, withBase } from 'vitepress';
import ReadingNavigation from './ReadingNavigation.vue';
import { sectionForPage } from './navigation.mjs';

const { page, theme, frontmatter } = useData();
const section = computed(() => sectionForPage(theme.value.sidebar || [], page.value.relativePath));
const showBreadcrumb = computed(() => frontmatter.value.sidebar !== false && section.value);
</script>

<template>
  <DefaultTheme.Layout>
    <template #sidebar-nav-before>
      <ReadingNavigation />
    </template>
    <template #doc-before>
      <nav v-if="showBreadcrumb" class="reading-breadcrumb" aria-label="当前位置">
        <a :href="withBase('/')">首页</a>
        <span class="vpi-chevron-right" aria-hidden="true" />
        <span>{{ section.text }}</span>
        <span class="vpi-chevron-right" aria-hidden="true" />
        <span aria-current="page">{{ frontmatter.title || page.title }}</span>
      </nav>
    </template>
  </DefaultTheme.Layout>
</template>
