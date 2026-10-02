/** Read-only route audit. Use staging accounts; never commits UI forms or sends email. */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = process.env.UI_AUDIT_BASE_URL || 'http://127.0.0.1:3000';
const apiUrl = process.env.UI_AUDIT_API_URL;
const width = Number(process.env.UI_AUDIT_WIDTH || 390);
const fixtures = {
  eventId: process.env.UI_AUDIT_EVENT_ID || 'event',
  presentationId: process.env.UI_AUDIT_PRESENTATION_ID || 'presentation',
  eventMemberId: process.env.UI_AUDIT_EVENT_MEMBER_ID || 'registration',
  sectionId: process.env.UI_AUDIT_SECTION_ID || 'section',
  memberId: process.env.UI_AUDIT_MEMBER_ID || 'member',
  slug: 'dr-cesar-ozuna-lopez',
};
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? walk(path.join(dir, entry.name)) :
      entry.name === 'page.tsx' ? [path.join(dir, entry.name)] : []);
}
const appDir = path.resolve('src/app');
const browser = await chromium.launch({
  headless: true,
  ...(process.env.UI_AUDIT_CHROMIUM ? { executablePath: process.env.UI_AUDIT_CHROMIUM } : {}),
});
const report = [];
try {
  for (const file of walk(appDir)) {
    const template = file.slice(appDir.length, -9).replace(/\/\([^/]+\)/g, '').replace(/\/$/, '') || '/';
    const role = template.startsWith('/admin') ? 'SUPERUSER' : template.startsWith('/staff') ? 'STAFF' : template.startsWith('/member') ? 'MEMBER' : '';
    const token = role ? process.env[`UI_AUDIT_TOKEN_${role}`] : undefined;
    if (role && !token) { report.push({ template, skipped: `Missing ${role} test token` }); continue; }
    const requestId = template.includes('membresia') || template.includes('/miembros/') || template.includes('/socios/')
      ? process.env.UI_AUDIT_MEMBERSHIP_REQUEST_ID || 'membership'
      : process.env.UI_AUDIT_EVENT_REQUEST_ID || 'request';
    const route = template.replace(/\[(\w+)\]/g, (_, key) => key === 'requestId' ? requestId : fixtures[key]);
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    if (token) await context.addInitScript(value => localStorage.setItem('ameca_token', value), token);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    if (apiUrl) await page.route('**/api/v1/**', async interception => {
      const url = new URL(interception.request().url());
      const response = await interception.fetch({ url: apiUrl.replace(/\/$/, '') + url.pathname + url.search });
      await interception.fulfill({ response });
    });
    try {
      const response = await page.goto(baseUrl + route, { waitUntil: 'networkidle' });
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      const redirected = new URL(page.url()).pathname === '/login' && role !== '';
      const violations = axe.violations.map(v => ({ id: v.id, impact: v.impact, count: v.nodes.length, selectors: v.nodes.map(n => n.target) }));
      report.push({ template, route, status: response.status(), width, redirected, overflow, errors, violations });
      console.log(`${route}: ${redirected || overflow || errors.length || violations.length ? 'REVIEW' : 'PASS'}`);
    } catch (error) {
      report.push({ template, route, error: error.message });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
fs.writeFileSync(process.env.UI_AUDIT_OUTPUT || 'ui-audit-results.json', JSON.stringify(report, null, 2));
if (report.some(r => r.error || r.redirected || r.overflow || r.errors?.length || r.violations?.length || r.status >= 400)) process.exitCode = 1;
