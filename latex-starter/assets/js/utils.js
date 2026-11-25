'use strict';

/* ==========================================================================
   مولّد قوالب لاتك — LaTeX Starter
   --------------------------------------------------------------------------
   هذا الجزء: الدوال المساعدة العامة (utils) — نقية بلا حالة ولا اعتماد
   على بقية الأجزاء، وتعمل في المتصفح وفي Node للاختبارات على حد سواء.
   كل شيء داخل IIFE حتى لا تتسرب الأسماء إلى النطاق العام؛
   يُعرَّف كائن واحد فقط: window.LX في المتصفح، وmodule.exports في Node.
   ========================================================================== */

(() => {

/* ---------- HTML ---------- */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ---------- نصوص ---------- */

function slugify(name) {
  return (
    name
      .trim()
      .replace(/[^A-Za-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'latex-project'
  );
}

/* اسم ملف بدون امتداد: يزيل الرموز الممنوعة ولواحقة ‎.tex المتكررة إن كتبها المستخدم */
function sanitizeFileName(name) {
  let s = String(name).trim().replace(/[\\/:*?"<>|\s]/g, '_');
  s = s.replace(/\.+$/, '').replace(/(?:\.tex)+$/i, '');
  return s || 'main';
}

/* ---------- المتصفح (تنزيل وحافظة) ---------- */

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  }
}

/* ---------- التصدير: وحدة في Node، وكائن عام LX في المتصفح ---------- */

const LX = { escapeHtml, slugify, sanitizeFileName, saveBlob, copyToClipboard };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LX;
} else {
  (typeof window !== 'undefined' ? window : globalThis).LX = LX;
}

})();
