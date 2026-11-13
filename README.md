# 🎥 Live Sarahah - TikTok Live & OBS Anonymous Messages

منصة متكاملة ومفتوحة المصدر لاستقبال الرسائل المجهولة من المتابعين، وعرضها في البث المباشر على **TikTok Live Studio** و **OBS Studio** ككروت نيون عائمة بتصميم ثلاثي الأبعاد وسينمائي.

![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=for-the-badge&logo=typescript)

---

## ✨ المميزات الرئيسية

1. **🔗 صفحة إرسال مخصصة للمتابعين (Public Bio Link):**
   - مطابقة لتصميم التيك توك مع تأثير الـ 3D Glitch اللوني على الاسم الكبير.
   - دائرة بروفايل مع شارة **`• LIVE`** متوهجة.
   - مربع تحديد **موضوع النقاش الآن 📌** والتحذيرات.
   - صندوق كتابة رسائل مجهولة 100% مع عداد حروف (1000 حرف).

2. **🎬 كارت البث والـ OBS (TikTok Live Studio Overlay):**
   - صفحة مخصصة شفافة بالكامل (`/overlay/[username]`) للاستخدام كمصدر متصفح (**Browser Source**).
   - إطار نيون متوهج بتدرج سماوي وفوشيا مع شارة `رسالة مجهولة 💌`.
   - يظهر فوق كاميرا الستريمر بدون أي خلفية سوداء أو حواف مزعجة.

3. **📊 لوحة تحكم صانع المحتوى (Creator Dashboard):**
   - استقبال الرسائل لحظياً (Real-time).
   - إمكانية تثبيت الرسائل أو حذفها أو عرضها مباشرة في اللايف بضغطة زر.
   - زر لتصدير أي رسالة كصورة **PNG عالية الدقة** للمشاركة على استوري إنستغرام وتيك توك.
   - تخصيص كامل للبروفايل (رفع صورة، تعديل الاسم، موضوع النقاش).

---

## 🚀 كيفية التثبيت والتشغيل محلياً

```bash
# 1. تثبيت الحزم
npm install

# 2. تشغيل السيرفر في وضع التطوير
npm run dev

# 3. بناء نسخة الإنتاج
npm run build
npm start
```

افتح المتصفح على: `http://localhost:3000`

---

## 📺 ربط الكارت مع TikTok Live Studio أو OBS Studio

1. انسخ الرابط الشفاف من لوحة التحكم (`http://localhost:3000/overlay/[username]`).
2. في برنامج **TikTok Live Studio** أو **OBS Studio**، اضغط على **إضافة مصدر (+ Add Source)**.
3. اختر **Browser (مستعرض ويب)**.
4. الصق الرابط واضبط العرض على `650` والارتفاع على `400`.
5. ضع الكارت في أي مكان فوق كاميرتك في البث!

---

## 📜 الترخيص
MIT License - مفتوح المصدر ومجاني للاستخدام.
