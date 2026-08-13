# تكامل Supabase لوضع Room

هذا المشروع يستخدم الآن **Supabase REST عبر HTTPS** لتخزين غرف اللعب بين جهازين. لا يعتمد وضع Room على اتصال PostgreSQL مباشر، ولذلك يعمل في بيئات لا تتوفر فيها شبكة IPv6 إلى المضيف المباشر لقاعدة البيانات.

## المخطط وقواعد الحماية

ينشئ ملف `room-schema.sql` الجداول `users` و`rooms` و`seats` و`seat_tokens`. تم تنفيذه بالفعل في المشروع المرتبط. إذا احتجت إلى إنشاء بيئة جديدة، نفّذ الملف كاملًا من **Supabase Dashboard → SQL Editor → New query → Run**.

| حد الحماية | التطبيق في هذا المشروع |
|---|---|
| الوصول للبيانات | الخادم وحده يتصل بـ `/rest/v1` من خلال HTTPS؛ المتصفح لا يستدعي Supabase مباشرة. |
| مفاتيح Supabase | `SUPABASE_SERVICE_ROLE_KEY` سر خادمي فقط ولا يظهر في أي متغير `VITE_*` أو كود عميل. توصي Supabase صراحةً بحصر مفاتيح الخدمة/الأسرار في مكونات خلفية موثوقة لأنها تتجاوز RLS.[1] |
| RLS | المخطط يفعّل RLS ويمنع أدوار `anon` و`authenticated` من جداول Room. RLS مطلوب للجداول الموجودة في مخطط مكشوف مثل `public`.[2] |
| خصوصية اللاعب | يعيد الخادم السر وقائمة الاستبعاد والـ Hearts الخاصة بالمقعد المطلوب فقط؛ لا يعود سر الخصم أو قائمته ضمن لقطة الحالة. |
| استعادة المقعد | يخزن العميل Seat Token قصير العمر في `sessionStorage`، بينما يحتفظ Supabase ببصمته SHA-256 فقط. |

## متغيرات التشغيل

تُضبط جميع القيم في أسرار المشروع، ولا تُضاف إلى Git أو ملفات `.env` أو الشيفرة.

| المتغير | مطلوب | الاستخدام |
|---|---:|---|
| `SUPABASE_URL` | نعم | رابط مشروع Supabase، ويُستخدم لبناء مسار REST الخادمي. |
| `SUPABASE_SERVICE_ROLE_KEY` | نعم | مفتاح خدمة/Secret Key خادمي للوصول إلى جداول Room المحمية. لا تستخدم مفتاح `anon` أو `publishable` لهذا المسار. |
| `SUPABASE_DB_URL` | لا | غير مستخدم في النسخة الحالية؛ يُترك فقط إن احتجت لاحقًا إلى مهام PostgreSQL مباشرة من بيئة تدعم IPv6 أو pooler متوافقًا. |

> لا تُضمِّن أبدًا مفتاح الخدمة في ملف العميل أو GitHub Pages. تؤكد Supabase أن مفاتيح الخدمة يجب أن تبقى في الخلفية لأنها تملك وصولًا مرتفعًا وتتجاوز RLS.[1]

## ما تم التحقق منه

| الفحص | النتيجة |
|---|---|
| تفويض Supabase REST بمفتاح الخدمة | نجح على جدول `rooms`. |
| فحوص Vitest | 6 اختبارات نجحت، وتشمل صحة الاتصال وRLS الوصول الخادمي وإسقاط الخصوصية. |
| فحص TypeScript وبناء الإنتاج | نجحا. |
| محاكاة متصفحين | نجحت في إنشاء غرفة، الانضمام، الاستعداد، اختيار سرين خاصين، تمرير الدور، الاستعادة بعد التحديث، وحظر التبويب المكرر. |

## تحقق RLS النهائي في لوحة Supabase

المعلومة المتاحة عن المخطط هي نتيجة SQL Editor **بعد التنفيذ**: ظهرت الجداول الأربعة المطلوبة. لا توجد لقطة محفوظة للـ schema قبل التنفيذ، لذلك لا ينبغي التعامل معها كفحصٍ سابق للترحيل. للتحقق الآن من عدم بقاء صلاحيات مباشرة لـ `anon` أو `authenticated`، نفّذ الاستعلام التالي في SQL Editor. النتيجة الصحيحة هي **صفر صفوف**.

```sql
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('users', 'rooms', 'seats', 'seat_tokens')
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;
```

هذا تحقق إضافي لقاعدة `REVOKE` في ملف المخطط، بينما اختبار المشروع المؤتمت يثبت وصول مفتاح الخدمة الخادمي إلى `rooms`. لا تشارك أي مفتاح عند تنفيذ هذا الاستعلام.

## GitHub Pages ووضع Room

GitHub Pages يستضيف ملفات ثابتة فقط. لذلك يمكنه استضافة **وضع اللعب على جهاز واحد**، لكنه لا يستطيع تشغيل خادم tRPC أو حفظ `SUPABASE_SERVICE_ROLE_KEY` بأمان. النسخة الرئيسية التي تشمل Room يجب أن تُنشر من بيئة خادمية مثل WebDev Publish. عند تجهيز GitHub Pages لاحقًا، سيُبنى إصدار static مستقل يستبعد مسارات Room بدل كشف أي سر أو تعطيل حدود الخصوصية.

## مراجع

[1]: https://supabase.com/docs/guides/getting-started/api-keys "Supabase: Understanding API keys"
[2]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase: Row Level Security"
