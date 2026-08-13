# GitHub Pages — اللعب المحلي فقط

يُنتج الأمر `pnpm build:github-pages` نسخة ثابتة داخل `dist/github-pages`. تستخدم هذه النسخة مسارات `#` حتى تعمل من مجلد المستودع `Guess-Who-Digital-Edition`، وتضم نسخة محلية من الشعار وكل صور البطاقات المستخدمة. تبقى مسارات اللعب المحلي فقط متاحة: Pass & Play وSplit Screen ولوحة النتائج المحلية.

| الأمر | النتيجة |
|---|---|
| `pnpm build:github-pages` | يبني Vite بوضع `github-pages`، ويستخرج الصور المرجعية من خادم التطوير إلى `dist/github-pages/manus-storage`. |
| `GITHUB_PAGES_ASSET_SOURCE=https://… pnpm build:github-pages` | يتيح تحديد مصدر بديل لخادم WebDev عند تصدير الأصول. |
| `pnpm preview:github-pages` | يشغّل معاينة محلية على `http://localhost:4174/Guess-Who-Digital-Edition/` تحاكي مسار GitHub Pages الفعلي. |

ينسخ التصدير الحالي **612 أصلًا**: شعار اللعبة و611 صورة بطاقة، بأسماء مطابقة لسجلات اللعبة. لذلك تتحول كل مراجع `/manus-storage/` في الإصدار الثابت إلى ملفات داخل `docs/manus-storage/` عند المزامنة، ولا تعود طلبات الصور إلى نطاق WebDev.

يستخدم وضع GitHub Pages نقطة تشغيل `App.github-pages.tsx` مستقلة؛ فهي لا تستورد مسارات أو مكونات Room أو tRPC. تأكد بناء Pages من عدم وجود أي ملف أصول باسم `Room*`، في حين يظل تطبيق WebDev الرئيسي محتفظًا بوضع Room الخادمي دون تغيير.

تم التحقق محليًا من Pass & Play وSplit Screen ونافذة كشف السر وشاشة النتيجة. تتحقق المحاكاة أيضًا من أن صور البطاقات تظهر عبر `/Guess-Who-Digital-Edition/manus-storage/…` ولا تسجل أي طلب إلى المسار الجذري `/manus-storage/…`.

لا تُنسخ مفاتيح Supabase ولا مسارات Room إلى النسخة المنشورة. GitHub Pages لا يشغّل خادم tRPC ولا يمكنه حفظ `SUPABASE_SERVICE_ROLE_KEY` سرًا؛ لذلك تبقى الغرف بين جهازين متاحة فقط في النشر الخادمي الرئيسي.

بعد دفع مجلد `docs/` الناتج إلى المستودع، اختر في إعدادات GitHub Pages المصدر **Deploy from a branch** ثم الفرع `main` والمجلد `/docs`.
