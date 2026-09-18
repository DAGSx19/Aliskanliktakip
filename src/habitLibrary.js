export const CATEGORIES = [
  { id: "trend", title: "🔥 Trend Olan Alışkanlıklar", habits: [
    ["📵","Sosyal medyaya ara ver"],["💧","Günlük su hedefini tamamla"],["📖","10 dakika kitap oku"],
    ["🚶","20 dakika açık hava yürüyüşü yap"],["🧘","5 dakika meditasyon yap"],["📝","Günlük tut"],
    ["🌅","Erken kalk"],["🌙","Uyku rutinini tamamla"],["💻","Yeni bir beceri öğren"],["🧹","10 dakikalık hızlı düzenleme yap"],
  ]},
  { id: "vazgecilmez", title: "❤️ Vazgeçilmez Alışkanlıklar", habits: [
    ["🛏️","Yatağını topla"],["🪥","Dişlerini fırçala"],["🧼","Yüzünü yıka"],["🪟","Odanı havalandır"],
    ["📋","Günlük planını yap"],["🥛","Güne bir bardak su ile başla"],["🎯","Bugünün en önemli işini tamamla"],
  ]},
  { id: "beslenme", title: "🍎 Sağlıklı Yiyip İçin", habits: [
    ["🍟","Kızarmış yiyecekleri azalt"],["🥤","Şekerli içecek yerine su tercih et"],["🍎","Bugün taze bir meyve ye"],
    ["🥦","Ana öğününe sebze ekle"],["🥗","Öğün çeşitliliğini artır"],
  ]},
  { id: "aktif", title: "🏃 Aktif Kal, Forma Gir", habits: [
    ["🚶","Tempolu yürüyüş yap"],["⚽","Spor veya antrenman yap"],["🚲","Bisiklete bin"],
    ["🏋️","Kısa bir kuvvet antrenmanı yap"],["🧘","Esneme ve stretching yap"],
  ]},
  { id: "stres", title: "🧘 Stresi Azalt", habits: [
    ["🌬️","5 dakika derin nefes egzersizi yap"],["🎧","Sevdiğin rahatlatıcı müziği dinle"],["📵","30 dakika tüm bildirimleri kapat"],
  ]},
  { id: "disiplin", title: "🛡️ Öz Disiplin Kazan", habits: [
    ["⏰","Alarmını ertelemeden kalk"],["🚀","Ertelediğin bir işi başlat"],["📱","Gereksiz ekran süresini sınırla"],
  ]},
  { id: "uretkenlik", title: "⚡ Üretkenlikte Ustalaş", habits: [
    ["🎯","Günün 3 ana önceliğini belirle"],["⏱️","25 dakika kesintisiz odaklan (Pomodoro)"],["💻","30 dakika kod yaz veya teknik çalış"],
  ]},
  { id: "butce", title: "💰 Parayı Bütçele", habits: [
    ["💵","Bugünkü tüm harcamalarını kaydet"],["📊","Haftalık bütçe durumunu kontrol et"],["🪙","Küçük de olsa kenara para ayır"],
  ]},
  { id: "dijital", title: "📱 Dijital Hayat", habits: [
    ["📵","30 dakika sosyal medyadan uzak dur"],["🔕","Gereksiz bildirimleri kalıcı olarak kapat"],
  ]},
  { id: "yatirim", title: "💻 Kendine Yatırım Yap", habits: [
    ["🇬🇧","15 dakika yabancı dil pratik yap"],["💻","30 dakika yazılım / kodlama çalış"],["🎓","Bir eğitim videosu veya kurs izle"],
  ]},
  { id: "kariyer", title: "🧑‍🎓 Kariyer Gelişimi", habits: [
    ["📄","CV veya portföyünü güncelle"],["🔗","LinkedIn / GitHub profiline bir güncelleme ekle"],["🗂️","Bir projeni belgelendir (README, dokümantasyon)"],
  ]},
  { id: "cevre", title: "🌍 Çevre Bilinci", habits: [
    ["♻️","Bir kez kullanımlık plastik kullanma"],["🚶","Kısa mesafede araç yerine yürü veya bisiklet kullan"],
  ]},
];

// Kart renkleri sırayla döner (ekran görüntüsündeki gradyan kartlar gibi)
export const CARD_GRADIENTS = [
  ["#E14C4C", "#B5342F"], // kırmızı
  ["#2CA9D6", "#1B7FA8"], // mavi
  ["#F2A93B", "#D9821E"], // turuncu
  ["#3D7CE0", "#2C58B5"], // indigo
  ["#33A377", "#1F7A56"], // yeşil
  ["#9B6BD9", "#6E45AD"], // mor
];

export function gradientFor(index) {
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
}
