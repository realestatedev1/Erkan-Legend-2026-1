// Türkiye Şehir, İlçe ve Mahalle Verileri
export const turkeyLocations = {
  "İstanbul": {
    "Beşiktaş": ["Etiler", "Levent", "Gayrettepe", "Ortaköy", "Bebek", "Arnavutköy"],
    "Kadıköy": ["Moda", "Fenerbahçe", "Acıbadem", "Bostancı", "Göztepe", "Erenköy"],
    "Şişli": ["Mecidiyeköy", "Osmanbey", "Nişantaşı", "Bomonti", "Merkez"],
    "Sarıyer": ["Maslak", "Istinye", "Tarabya", "Yeniköy", "Bahçeköy"],
    "Üsküdar": ["Acıbadem", "Çengelköy", "Kuzguncuk", "Bağlarbaşı", "Altunizade"],
    "Bakırköy": ["Ataköy", "Yeşilköy", "Florya", "Kartaltepe", "Merkez"],
    "Maltepe": ["Cevizli", "İdealtepe", "Altayçeşme", "Küçükyalı"],
    "Ataşehir": ["Ataşehir Merkez", "Küçükbakkalköy", "İçerenköy", "Ferhatpaşa"],
    "Başakşehir": ["Başakşehir Merkez", "Bahçeşehir", "Kayabaşı"],
    "Beylikdüzü": ["Beylikdüzü Merkez", "Adnan Kahveci", "Gürpınar"],
  },
  "Ankara": {
    "Çankaya": ["Kavaklıdere", "Çankaya Merkez", "Dikmen", "Ayrancı", "Gaziosmanpaşa"],
    "Keçiören": ["Keçiören Merkez", "Etlik", "Aktepe", "Ovacık"],
    "Mamak": ["Mamak Merkez", "Derbent", "Akdere"],
    "Yenimahalle": ["Batıkent", "Demetevler", "Ergazi"],
    "Etimesgut": ["Eryaman", "Elvankent", "Güzelkent"],
    "Sincan": ["Sincan Merkez", "Yenikent"],
    "Pursaklar": ["Saray", "Merkez"],
  },
  "İzmir": {
    "Konak": ["Alsancak", "Konak Merkez", "Basmane", "Çankaya"],
    "Karşıyaka": ["Karşıyaka Merkez", "Bostanlı", "Mavişehir", "Çiğli"],
    "Bornova": ["Bornova Merkez", "Evka", "Erzene", "Örnekköy"],
    "Buca": ["Buca Merkez", "Kuruçeşme", "Kaynaklar"],
    "Çeşme": ["Çeşme Merkez", "Alaçatı", "Ilıca", "Dalyan"],
    "Urla": ["Urla Merkez", "Zeytinalanı", "Barbaros"],
    "Gaziemir": ["Gaziemir Merkez", "Aktepe"],
    "Balçova": ["Balçova Merkez", "Teleferik"],
  },
  "Antalya": {
    "Muratpaşa": ["Lara", "Konyaaltı", "Güzeloba", "Fener"],
    "Kepez": ["Kepez Merkez", "Varsak", "Otogar"],
    "Konyaaltı": ["Konyaaltı Merkez", "Arapsuyu", "Hurma"],
    "Alanya": ["Alanya Merkez", "Mahmutlar", "Oba", "Cikcilli"],
    "Belek": ["Belek Merkez", "Kadriye"],
    "Manavgat": ["Manavgat Merkez", "Side", "Çolaklı"],
  },
  "Bursa": {
    "Osmangazi": ["Osmangazi Merkez", "Soğanlı", "Odunluk"],
    "Nilüfer": ["Nilüfer Merkez", "Görükle", "Fethiye"],
    "Yıldırım": ["Yıldırım Merkez", "Millet", "Esenevler"],
    "Mudanya": ["Mudanya Merkez", "Güzelyalı"],
    "Gemlik": ["Gemlik Merkez", "Kumla"],
  },
  "Adana": {
    "Seyhan": ["Seyhan Merkez", "Güzelevler", "Ziyapaşa"],
    "Çukurova": ["Çukurova Merkez", "Balcalı"],
    "Sarıçam": ["Sarıçam Merkez", "Doğankent"],
    "Yüreğir": ["Yüreğir Merkez", "Havutlu"],
  },
};

// Şehir listesini alfabetik sıraya göre al
export const getCities = () => {
  return Object.keys(turkeyLocations).sort();
};

// Seçilen şehre göre ilçeleri getir
export const getDistricts = (city) => {
  if (!city || !turkeyLocations[city]) return [];
  return Object.keys(turkeyLocations[city]).sort();
};

// Seçilen şehir ve ilçeye göre mahalleleri getir
export const getNeighborhoods = (city, district) => {
  if (!city || !district || !turkeyLocations[city] || !turkeyLocations[city][district]) return [];
  return turkeyLocations[city][district].sort();
};
