# HabitOS

React + Vite + Firebase Realtime Database ile yapılmış alışkanlık takip uygulaması. Veriler Firebase'de anonim bir kullanıcı kimliğine bağlı olarak saklanır, bu yüzden sayfayı kapatıp açsan bile (Claude artifact'in aksine) hiçbir şey sıfırlanmaz.

## 1) Firebase projesini kur

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project** ile yeni bir proje oluştur (DAGSx19 için kullandığın hesabı da kullanabilirsin, ayrı bir proje aç).
2. Sol menüden **Build → Realtime Database** → **Create Database** → herhangi bir bölge seç → başlangıçta **test mode**'da başlat (sonra kuralları aşağıdaki gibi sıkılaştır).
3. Sol menüden **Build → Authentication** → **Get started** → **Sign-in method** sekmesinden **Anonymous**'u etkinleştir.
4. **Project settings (⚙️) → General → Your apps → Web (`</>`)** ile bir web app kaydet. Sana verilen `firebaseConfig` değerlerini kopyala.

## 2) Ortam değişkenlerini doldur

`.env.example` dosyasını `.env` olarak kopyala ve Firebase'den aldığın değerleri yapıştır:

```
cp .env.example .env
```

## 3) Realtime Database kurallarını ayarla

Her kullanıcı sadece kendi verisini okuyup yazabilsin diye, Database → Rules kısmına şunu yapıştır:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## 4) Yerelde çalıştır

```
npm install
npm run dev
```

## 5) GitHub'a yükle

```
git init
git add .
git commit -m "HabitOS ilk sürüm"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/habitos.git
git push -u origin main
```

## 6) Vercel'e deploy et

1. [vercel.com](https://vercel.com) → **Add New... → Project** → GitHub reponu seç.
2. **Environment Variables** kısmına `.env` dosyandaki 7 değişkeni tek tek ekle (VITE_FIREBASE_...).
3. **Deploy**'a bas. Build komutu otomatik olarak `vite build`, çıktı klasörü `dist` olarak algılanır.

Her `git push` yaptığında Vercel otomatik olarak yeniden deploy eder.

## Proje yapısı

- `src/App.jsx` — tüm ekranlar (Bugün / Yolculuk / Geçmiş / Ben) ve alışkanlık mantığı
- `src/habitLibrary.js` — ön ayarlı alışkanlık kategorileri, buraya yeni kategori/alışkanlık eklenebilir
- `src/firebase.js` — Firebase bağlantısı ve anonim giriş
- `src/index.css` — tüm görsel stil
