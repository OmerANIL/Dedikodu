# Dedikodu App - APK Oluşturma Rehberi

Bu rehber, React Native (Expo) projenizi Android telefonlarda doğrudan çalıştırabileceğiniz bir `.apk` dosyasına nasıl dönüştüreceğinizi adım adım açıklamaktadır.

Projenizin mimarisi gereği `nodejs_space` içindeki backend (arka uç) kodları uygulamanızın APK dosyasına dahil edilmez, arka uç kendi başına bir sunucuda çalışır. APK sadece `react_native_space` içindeki mobil uygulama (ön yüz) kodlarından oluşturulur. Bu nedenle backend'deki `nodemailer` gibi paketler, mobil uygulamanızın (APK'nın) oluşturulmasına kesinlikle engel olmaz.

---

## Yöntem 1: Bulutta (EAS) APK Oluşturma (Tavsiye Edilen)

Expo Application Services (EAS), projenizi güçlü bulut sunucularında derlemenizi sağlayan ücretsiz (belli bir sınıra kadar) bir servistir. Bilgisayarınızda ağır Android SDK veya Java kurulumları yapmanıza gerek kalmaz.

### Adım 1: EAS CLI'yi Yükleyin
Eğer bilgisayarınızda (veya terminalinizde) `eas-cli` yüklü değilse, aşağıdaki komutla global olarak kurun:

```bash
npm install -g eas-cli
```

### Adım 2: Expo Hesabınıza Giriş Yapın
Expo hesabınız yoksa [expo.dev](https://expo.dev) adresinden ücretsiz bir hesap oluşturun. Ardından terminalde giriş yapın:

```bash
eas login
```

### Adım 3: APK Derlemesini (Build) Başlatın
Terminalinizde (komut satırında) `react_native_space` klasörünün içinde olduğunuza emin olun. Ardından aşağıdaki komutu çalıştırın:

```bash
cd react_native_space
eas build -p android --profile preview
```

**Ne İşe Yarar?**
- `-p android`: Sadece Android için derleme yapar.
- `--profile preview`: `eas.json` dosyasında oluşturduğumuz `preview` ayarını kullanır. Bu ayar, varsayılan olarak Google Play Store formatı olan `.aab` yerine telefonlara doğrudan yüklenebilen `.apk` dosyası üretmesini sağlar.

### Adım 4: APK'yı İndirin
Derleme işlemi başladığında terminalde size bir link verilecektir (örneğin: `https://expo.dev/accounts/...`).
Bu linke tıklayarak buluttaki derleme sürecini izleyebilirsiniz.
Derleme bittiğinde (genellikle 5-15 dakika sürer), yine aynı sayfada veya terminalde bir **İndirme (Download)** bağlantısı çıkacaktır.

Bu bağlantıdan `.apk` dosyasını indirin, telefonunuza (kabloyla, WhatsApp veya Google Drive aracılığıyla) gönderin ve kurun.

---

## Yöntem 2: Kendi Bilgisayarınızda (Lokalde) APK Oluşturma

Eğer bulutu kullanmak istemiyor ve derlemeyi doğrudan kendi bilgisayarınızda yapmak istiyorsanız, bunu da EAS CLI yardımıyla yapabilirsiniz.

**Gereksinimler:**
- Bilgisayarınızda **Android Studio** ve **Android SDK** kurulu olmalıdır.
- Bilgisayarınızda uygun bir **Java (JDK)** kurulu olmalıdır.

### Adım 1: Lokal Derlemeyi Başlatın
`react_native_space` klasörü içinde şu komutu çalıştırın:

```bash
eas build -p android --profile preview --local
```

**Ne İşe Yarar?**
- `--local` bayrağı, projeyi buluta göndermeden kendi bilgisayarınızın işlemci ve belleğini kullanarak derlemenizi sağlar.

### Adım 2: APK Dosyasını Bulun
İşlem tamamlandığında, terminal ekranında oluşturulan `.apk` dosyasının yolu size gösterilecektir (genellikle projenizin ana klasöründe `build-*.apk` adında bir dosya oluşur).

---

## Sık Sorulan Sorular / Sorun Giderme

1. **"Install unknown apps" (Bilinmeyen kaynaklardan yükle) Hatası:**
   APK'yı Android telefonunuza kurarken cihaz güvenlik uyarısı verebilir. Ayarlara gidip "Bilinmeyen kaynaklardan yüklemeye izin ver" seçeneğini aktif etmeniz gerekebilir.

2. **Backend API Bağlantısı:**
   Uygulamayı telefona yüklediğinizde backend (Node.js sunucusu) ile konuşabilmesi için, telefonunuzun uygulamadaki API URL'sine ulaşabiliyor olması gerekir.
   Eğer backend sadece bilgisayarınızda (`localhost` veya `127.0.0.1`) çalışıyorsa, telefonunuz bilgisayarınızdaki backend'e erişemez.
   Bunun için ya bilgisayarınızın yerel ağdaki IP adresini kullanmalı (örn: `http://192.168.1.55:3000`) ya da backend'i bir sunucuya deploy etmelisiniz. (Uygulamanın `react_native_space` içindeki ilgili API config dosyasında bu URL'yi değiştirmeyi unutmayın!)
