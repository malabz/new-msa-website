// The theme consumes the existing generated sidebar, not a second page registry.
export function pageLink(relativePath = '') {
  return '/' + relativePath.replace(/\.md$/, '.html');
}

export function containsPage(item, link) {
  return item.link === link || Boolean(item.items?.some(child => containsPage(child, link)));
}

export function sectionForPage(groups, relativePath) {
  return groups.find(group => containsPage(group, pageLink(relativePath)));
}

export function headingIsActive(top, offset) {
  return top <= offset;
}
