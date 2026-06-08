import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(here, '..', 'index.html'), 'utf8');

const requiredText = [
  '三项关键校准',
  '课程边界',
  '引流逻辑',
  '生活馆定位',
  '内容种草',
  '体验引流',
  '9800 会员成交',
  '会员裂变',
  '茶园价值',
  '茶文化活动沙龙',
  '健康中医茶疗',
  '养生茶膳小火锅',
  '不诊断',
  '不治疗',
  'is-current',
  'is-prev',
  'is-next',
  'is-hidden'
];

for (const text of requiredText) {
  assert.ok(html.includes(text), `Missing required deck text or class: ${text}`);
}

assert.ok(html.includes("total:'13'"), 'Runtime slide metadata should declare 13 slides');
assert.ok(!html.includes('deck.style.transform=`translateX'), 'Deck should not use smooth horizontal translateX navigation');
assert.ok(!html.includes('transition:transform .9s'), 'Deck should not use the old smooth transform transition');
assert.ok(!html.includes('客户高层汇报 · V1.2'), 'Cover should not show the old customer leadership version kicker');
assert.ok(html.includes("classList.add('is-turning-out')"), 'Page flip should keep the outgoing page visible while it turns');
assert.ok(html.includes('wheelCooling'), 'Wheel navigation should throttle one physical slide gesture to one page');
assert.ok(html.includes('background:transparent;color:#fff'), 'Photo title block should be transparent text over the image');
assert.ok(!html.includes('rgba(255,255,255,.16)'), 'Photo title block should not keep the previous translucent panel');
assert.ok(html.includes('padding:3.2vh 5vw 12vh'), 'Bottom content should reserve space above navigation dots');
assert.ok(html.includes('font-size:56px'), 'Photo title font size should be reduced on desktop');
assert.ok(html.includes('transform 1.65s'), 'Page flip transition should be slowed down');
assert.ok(html.includes('},1660)'), 'Page flip lock duration should match the slower animation');
assert.ok(html.includes('object-position:center top'), 'Top images should prioritize the top of the image so people stay visible');
assert.ok(html.includes('padding:3.2vh 5vw 12vh'), 'Bottom content should reserve a larger safe area above navigation dots');
assert.ok(html.includes('.slide.is-turning-out .page-curl'), 'Page flip should include a curled page edge while turning');
assert.ok(html.includes('curl-sweep'), 'Page curl should animate during slide turning');
assert.ok(html.includes('photo-points nav-safe-bottom'), 'Point-summary slides should reserve a dedicated safe area above navigation dots');
assert.ok(html.includes('photo-body.has-points'), 'Point-summary slide bodies should use a larger bottom safe area');

const pageMatches = [...html.matchAll(/page:'(\d{2}) \/ 13/g)].map(match => match[1]);
assert.deepEqual(
  pageMatches,
  ['01','02','03','04','05','06','07','08','09','10','11','12','13'],
  'Runtime slide pages should be numbered 01 / 13 through 13 / 13'
);

const imageMatches = [...html.matchAll(/img:'([^']+)'/g)].map(match => match[1]);
assert.equal(imageMatches.length, 13, 'Runtime slides should define 13 image-backed pages');
for (const imgPath of imageMatches) {
  const relative = imgPath.replace(/^images\//, '');
  const absolute = resolve(here, '..', 'images', relative);
  readFileSync(absolute);
}

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const inlineScripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
  .map(match => ({
    attrs: match[1],
    code: match[2].trim()
  }))
  .filter(script => script.code);

for (const [index, script] of inlineScripts.entries()) {
  try {
    if (/type=["']module["']/i.test(script.attrs)) {
      new AsyncFunction(script.code);
    } else {
      new Function(script.code);
    }
  } catch (error) {
    throw new Error(`Inline script ${index + 1} has a syntax error: ${error.message}`);
  }
}

console.log('Deck v2 content and page-flip checks passed.');
