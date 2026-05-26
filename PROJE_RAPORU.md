# Dedikodu App - Proje Özeti ve Değerlendirme Raporu

## 1. Projenin Amacı ve Genel Özeti
"Dedikodu", kullanıcıların konumlarına (İl, İlçe, Mahalle) göre dedikodu (gossip) paylaşabildiği, okuyabildiği ve bu içeriklere tepki verebildiği (onay/red) konum tabanlı sosyal bir mobil uygulamadır.

Sistem, bir abonelik modeline sahiptir (Basic, Gold, Platinum). Standart (Basic) kullanıcılar sadece içerikleri okuyabilirken, Gold kullanıcılar içerik üretebilir. Platinum kullanıcılar ise ek olarak içerikleri onaylayıp reddedebilecekleri bir moderasyon yetkisine sahiptir.

## 2. Mimari ve Teknoloji Yığını
Proje, Backend (Node.js/NestJS) ve Frontend (React Native/Expo) olmak üzere iki ana dizinden oluşmaktadır:

*   **Backend (`nodejs_space/`)**: 
    *   **Framework**: NestJS (TypeScript tabanlı, modüler yapı)
    *   **Veritabanı & ORM**: PostgreSQL, Prisma ORM
    *   **Yetkilendirme**: JWT (JSON Web Token), bcrypt şifreleme
*   **Frontend (`react_native_space/`)**:
    *   **Framework**: React Native (Expo SDK 54)
    *   **Navigasyon**: expo-router (dosya bazlı yönlendirme)
    *   **UI/UX**: React Native Paper, özel "Ember" teması (Turuncu/Kırmızı gradyanlar), Koyu/Açık tema desteği.

## 3. Klasör ve Dosya Yapısı

### 3.1 Backend (`nodejs_space/`)
*   `src/`: Tüm iş mantığının bulunduğu ana klasör. Modüler (auth, gossip, location, admin, moderation vb.) olarak ayrılmıştır.
*   `prisma/`: Veritabanı şeması (`schema.prisma`) ve başlangıç verilerini sağlayan (`seed.ts`) dosyaları içerir.
*   `package.json`: Bağımlılıklar.

### 3.2 Frontend (`react_native_space/`)
*   `app/`: `expo-router` ile çalışan ana ekranlar ve navigasyon yapılandırması.
    *   `auth/`: Giriş ve kayıt ekranları (`login.tsx`, `register.tsx`).
    *   `tabs/`: Uygulamanın alt sekmeleri (Ana Sayfa, Yaz, Moderasyon, Profil).
    *   `admin/`: Süper kullanıcı (superuser) için istatistik ve kullanıcı yönetim paneli.
*   `src/`: Yeniden kullanılabilir bileşenler, context yapıları (Theme, Auth) ve servisler.

## 4. İyileştirme ve Geliştirme Önerileri

Mevcut tasarım (API, DB ve UX) oldukça başarılı kurgulanmış olmakla birlikte, aşağıdaki alanlarda geliştirmeler yapılması projenin kalitesini ve güvenliğini artıracaktır:

### 4.1. Veritabanı ve Performans
*   **Soft Delete**: `ON DELETE CASCADE` yerine veritabanına `deletedAt` alanı eklenerek verilerin kalıcı silinmesinin önüne geçilebilir. Bu sayede bir kullanıcı silinse bile istatistikler ve geçmiş tutulabilir.
*   **Önbellekleme (Caching)**: Türkiye'nin tüm il, ilçe ve mahalleleri (on binlerce kayıt) çok nadir değişen bir veridir. `GET /api/provinces` gibi endpoint'ler Redis vb. bir in-memory cache sunucusundan sunulursa veritabanı yükü önemli ölçüde azalır.
*   **Rate Limiting**: Kullanıcıların art arda çok hızlı istek atmasını (özellikle SMS/Email doğrulama istekleri ve dedikodu gönderme gibi) engellemek için `Throttler` kullanılmalıdır.

### 4.2. Güvenlik ve Yetkilendirme
*   **Refresh Token**: Şu anda JWT doğrulaması uzun süreli Access Token'larla yapılıyorsa, güvenliği artırmak için kısa süreli Access Token ve uzun süreli Refresh Token mekanizmasına geçilmelidir.
*   **Raporlama Sistemi**: Mevcut "Beğenmeme (Disapprove)" mekanizması dışında nefret söylemi veya spam içerikleri moderatörlere bildirmek için özel bir "Şikayet Et (Report)" butonu eklenmelidir.

### 4.3. Kullanıcı Deneyimi (UX/UI)
*   **Anlık Bildirimler (Push Notifications)**: `expo-notifications` projenize dahil edilmiş. Kullanıcıların dedikoduları onaylandığında, reddedildiğinde veya bulundukları mahallede popüler bir dedikodu paylaşıldığında bildirim atılması kullanıcı bağlılığını artırır.
*   **Kilit (Locking) Mekanizması**: Birden fazla Platinum üyenin aynı dedikoduyu eşzamanlı olarak moderasyon ekranında görmesi ve farklı kararlar vermesini (Concurrency) engellemek için incelemeye alınan dedikodu geçici olarak kilitlenmelidir.
