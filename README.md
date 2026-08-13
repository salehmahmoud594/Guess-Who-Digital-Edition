# 🕵️‍♂️ Guess Who: Digital Edition | خمن من؟ — النسخة الرقمية

> **A beautifully illustrated, real-time two-player guessing game.**  
> **لعبة التخمين الكلاسيكية الشهيرة "خمن من؟" بتصميم عصري وأوضاع لعب متعددة (محلياً وعبر الإنترنت).**

---

## 🌟 Features | المميزات الرئيسية

### 🎮 Game Modes | أوضاع اللعب
- **📱 Pass & Play (جهاز واحد - تبادل الأدوار):** العب مع صديقك على نفس الجهاز مع ميزة إخفاء البطاقة السرية وحمايتها من التلصص.
- **💻 Split Screen (جهاز واحد - شاشة مقسمة):** شاشة مقسمة للاعبين جنباً إلى جنب على الأجهزة اللوحية أو شاشات الكمبيوتر.
- **🌐 Room Mode (عبر جهازين - أونلاين):** إنشاء أو الانضمام إلى غرفة باستخدام كود مكون من 6 خانات، مع مزامنة فورية ومباشرة للأدوار والبطاقات المستبعدة عبر **Supabase Realtime**.
- **🏆 Local Leaderboard (لوحة المتصدرين):** تسجيل النتائج والإحصائيات وتاريخ المواجهات بين اللاعبين.

---

### 🎨 Categories | فئات وبطاقات اللعب
تضم اللعبة أكثر من **700 بطاقة مرسومة بدقة** موزعة عبر 6 عوالم مختلفة (24 بطاقة يتم اختيارها عشوائياً في كل جولة):

| الفئة | الوصف | الفئة البرمجية |
| :--- | :--- | :--- |
| 🐾 **Animals** | 88 كارت لحيوانات ورسومات كرتونية لطيفة | `animals` |
| ◉ **Characters** | 144 شخصية ووجوه مرسومة بتفاصيل مميزة | `fictional_characters` |
| ✦ **Cartoon Characters** | 123 شخصية كرتونية شهيرة | `cartoon_characters` |
| ▦ **Egyptian Movies** | 150 بوستر لأشهر كلاسيكيات وأفلام السينما المصرية | `egyptian_movies` |
| 🎬 **Cartoon Movies** | 100 بوستر لأفلام الأنميشن والكرتون العالمية | `cartoon_movies` |
| 😀 **Emojis** | 100 إيموجي وتعبير وجه مختلف | `emojis` |

---

## 🛠️ Tech Stack | التقنيات المستخدمة

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Wouter](https://github.com/molefrog/wouter) (Hash & Path Routing), [Lucide React Icons](https://lucide.dev/).
- **Backend & Realtime:** [Supabase](https://supabase.com/) (PostgreSQL, Realtime Subscriptions, Anonymous Auth, Row Level Security - RLS).
- **Testing & Quality:** [Vitest](https://vitest.dev/), TypeScript strict checking.

---

## 🚀 Getting Started | التشغيل المحلي

### 1. المتطلبات الأساسية
- **Node.js:** الإصدار 20 أو أحدث.
- **pnpm:** مدير الحزم الموصى به (`npm install -g pnpm`).

### 2. تثبيت الحزم
```bash
pnpm install
```

### 3. إعداد متغيرات البيئة (`.env`)
أنشئ ملف `.env` في المسار الرئيسي وضَع مفاتيح مشروع Supabase:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### 4. تشغيل خادم التطوير
```bash
pnpm dev
```
افتح المتصفح على `http://localhost:5173`.

### 5. تشغيل الاختبارات
```bash
pnpm test
pnpm check
```

---

## 📦 GitHub Pages Deployment | النشر على GitHub Pages

يتم تصدير التطبيق تلقائياً إلى مجلد `docs/` ليعمل بسلاسة كـ Single Page Application (SPA) على GitHub Pages:

### 1. أمر البناء والتصدير
```bash
pnpm build:github-pages
```

### 2. إعدادات GitHub Pages
في صفحة المستودع على GitHub:
1. اذهب إلى **Settings** ⚙️ ➔ **Pages**.
2. في قسم **Build and deployment**:
   - **Source:** اختر `Deploy from a branch`.
   - **Branch:** اختر `main`.
   - **Folder:** اختر `/docs`.
3. اضغط **Save** وسيتم نشر الموقع مباشرة.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
