# Dedikodu — UX Specification

## Design Direction

- **Theme**: Dark mode default (backgrounds #0D0D0D, #1A1A1A, #242424), with light mode toggle (warm off-whites #F5F2EB, #FFFDF7)
- **Color Palette**: Ember — Primary #F97316 (warm orange), Accent #EF4444 (red). Approve reactions use #10B981 (green), Disapprove use #EF4444 (red)
- **Typography**: Display/Heading: "Nunito" (bold, rounded, friendly for gossip vibe), Body: "Source Sans 3". Display 32px → Heading 22px → Body 16px → Caption 13px
- **Backgrounds**: Layered dark gradients (#0D0D0D → #1A1A1A), cards with subtle glass/translucent effect
- **Language**: All UI text in Turkish

## Animation & Motion

- Screen transitions: fade+slide matching navigation direction
- Button press: scale 0.97 spring + haptic on mobile
- Gossip cards: staggered fade-in on list load
- Reaction buttons: scale bounce on tap + haptic
- Loading: skeleton shimmer for gossip lists
- Bottom sheets (location picker): multi-snap with backdrop blur
- Respect reduced motion preferences

## Component Standards

- Buttons: gradient fill [#F97316, #EF4444], press animation, loading/disabled states
- Inputs: floating labels, focus border animation, error shake, validation messages in Turkish
- Cards: rounded 16px, glass effect background, subtle shadow
- Lists: @shopify/flash-list for gossip feed, staggered entry animation
- States: skeleton loading, empty states with Turkish messaging, error states with retry
- Spacing: 8pt grid. Border radius: sm:8, md:12, lg:16, xl:24
- Accessibility: contrast >= 4.5:1, touch targets 44pt+, accessible labels

## Screens

### 1. Giriş (Login) — `app/auth/login.tsx`
- **Purpose**: Email + password login
- **UI Elements**:
  - App logo + "Dedikodu" title (Display, centered)
  - Email input (floating label "E-posta")
  - Password input (floating label "Şifre", toggle visibility)
  - "Giriş Yap" gradient button (full width)
  - "Hesabın yok mu? Kayıt Ol" text link below
- **Actions**:
  - Tap "Giriş Yap" → calls login; on success AuthProvider state updates, layout switches to authenticated tab group
  - Tap "Kayıt Ol" link → push to Kayıt Ol screen

### 2. Kayıt Ol (Register) — `app/auth/register.tsx`
- **Purpose**: New user registration
- **UI Elements**:
  - "Kayıt Ol" heading
  - Nickname input ("Kullanıcı Adı")
  - Full name input ("Ad Soyad")
  - Email input ("E-posta")
  - Phone input ("Telefon")
  - Password input ("Şifre", min 6 chars)
  - Password confirm input ("Şifre Tekrar")
  - "Kayıt Ol" gradient button
  - "Zaten hesabın var mı? Giriş Yap" text link
- **Actions**:
  - Tap "Kayıt Ol" → calls signup; on success AuthProvider state updates, layout switches to authenticated tab group
  - Tap "Giriş Yap" → pop back to login
- **Validation**: All fields required, email format, password match, nickname min 3 chars

### 3. Ana Sayfa (Home Feed) — `app/tabs/home.tsx`
- **Purpose**: Browse approved gossips with location filtering
- **UI Elements**:
  - Header: "Dedikodu" title + theme toggle icon button (top right)
  - Location filter bar (horizontal chips): "Tüm Türkiye" (default), then selected province, district, neighborhood. Tapping opens bottom sheet location picker
  - Gossip card list (FlashList, pull-to-refresh, infinite scroll):
    - Each card: gossip text, location line ("Mahalle, İlçe, İl"), author nickname, relative date ("2 saat önce"), approve count with ✓ icon (green), disapprove count with ✗ icon (red)
    - Two reaction buttons at card bottom: ✓ (approve) and ✗ (disapprove). Active state highlighted if user already reacted. Tapping toggles/changes reaction.
  - Empty state: "Henüz dedikodu yok" with illustration
- **Location Filter Bottom Sheet**:
  - Step 1: Province list (searchable). Option "Tüm Türkiye" at top to clear filter.
  - Step 2: District list for selected province. Option "Tüm İl" to filter by province only.
  - Step 3: Neighborhood list for selected district. Option "Tüm İlçe" to filter by district only.
  - Each step is a scrollable list inside the bottom sheet. Selecting advances to next step or closes sheet.

### 4. Dedikodu Yaz (Write Gossip) — `app/tabs/write.tsx`
- **Purpose**: Create a new gossip (Gold & Platinum only)
- **Gate**: If user subscription is "basic", show upgrade prompt: "Dedikodu yazmak için Gold veya Platinum aboneliğe geçin" with a button linking to Profile/subscription section. If email not verified, show: "Dedikodu yazmak için e-postanızı doğrulayın" with resend verification button.
- **UI Elements** (when authorized):
  - "Yeni Dedikodu" heading
  - 3-step location selector (same bottom sheet pattern as filter but required):
    - Display selected location as chips: İl > İlçe > Mahalle. Tap to re-select.
    - All three levels required.
  - Text area ("Dedikoduyu yazın..."), 300 char limit, live character counter ("245/300") that turns red at 280+
  - "Gönder" gradient button (disabled until location selected + text non-empty)
- **Actions**:
  - Tap "Gönder" → POST gossip → success snackbar "Dedikoduunuz moderasyon için gönderildi!" → clear form
  - Cannot edit/delete after submission (no UI for it)

### 5. Moderasyon (Moderation) — `app/tabs/moderation.tsx`
- **Purpose**: Review pending gossips (Platinum only)
- **Gate**: If user subscription is not "platinum", show: "Bu alan sadece Platinum üyeler içindir"
- **UI Elements**:
  - "Moderasyon" heading with pending count badge
  - List of pending gossip cards:
    - Gossip text, location ("Mahalle, İlçe, İl"), author nickname, submission date
    - Two action buttons per card: "Onayla" (green, approve) and "Reddet" (red, reject)
  - Empty state: "Bekleyen dedikodu yok 🎉"
- **Actions**:
  - Tap "Onayla" → PATCH status to approved → card animates out
  - Tap "Reddet" → confirmation dialog "Bu dedikoduyu reddetmek istediğinize emin misiniz?" → PATCH status to rejected → card animates out

### 6. Profil (Profile) — `app/tabs/profile.tsx`
- **Purpose**: View profile info, subscription, settings
- **UI Elements**:
  - User avatar placeholder (first letter of nickname, colored circle)
  - Nickname (large), email below
  - Email verification status badge: "Doğrulanmış ✓" (green) or "Doğrulanmamış" (orange) with "Doğrulama E-postası Gönder" button if unverified
  - Subscription card: current level ("Basic" / "Gold" / "Platinum") with colored badge
  - "Abonelik Değiştir" button → push to Subscription screen
  - Stats: "Gönderilen Dedikodular: N", "Onaylanan: N"
  - Theme toggle ("Tema: Koyu / Açık")
  - "Çıkış Yap" button (red outline) → calls logout; AuthProvider state updates, layout switches to unauthenticated stack
  - If user is superuser: "Yönetici Paneli" button → navigates to admin panel
- **Actions**:
  - Tap verification button → POST resend verification → snackbar
  - Tap subscription change → push to subscription screen
  - Tap admin panel → push to admin screens

### 7. Abonelik (Subscription) — `app/subscription.tsx`
- **Purpose**: Change subscription level
- **UI Elements**:
  - Three cards side by side or stacked:
    - **Basic**: "Okuma erişimi" — features list
    - **Gold**: "Okuma + Yazma" — features list
    - **Platinum**: "Okuma + Yazma + Moderasyon" — features list
  - Current plan highlighted. Other plans have "Geç" button.
  - Note: "Tüm abonelikler şu an ücretsizdir"
- **Actions**:
  - Tap "Geç" → PATCH subscription → success snackbar → navigate back

### 8. Yönetici Paneli (Admin Panel) — `app/admin/index.tsx`
- **Purpose**: Superuser dashboard
- **Gate**: If not superuser, redirect back
- **UI Elements**:
  - "Yönetici Paneli" heading
  - Stats cards: Total users, Total gossips, Pending gossips, Approved gossips, Removed gossips
  - "Kullanıcıları Yönet" button → push to user management

### 9. Kullanıcı Yönetimi (User Management) — `app/admin/users.tsx`
- **Purpose**: View and manage all users
- **UI Elements**:
  - Searchable user list (by nickname or email)
  - Each row: nickname, email, subscription badge, email verified status
  - Tap user row → push to user detail
- **Actions**:
  - Search filters list in real-time (client-side on loaded page, or query param)

### 10. Kullanıcı Detay (User Detail) — `app/admin/users/[userId]/index.tsx`
- **Purpose**: View user details and change subscription
- **UI Elements**:
  - Nickname, full name, email, phone, registration date, email verified status
  - Current subscription with dropdown/segmented control to change (Basic/Gold/Platinum)
  - "Kaydet" button to save changes
- **Actions**:
  - Change subscription → PATCH → success snackbar

## File Structure

```
app/
  _layout.tsx              — Root layout: AuthProvider + ThemeProvider, splash while isLoading
  auth/
    _layout.tsx            — If authenticated → <Redirect href="/tabs/home" />; else <Stack>
    login.tsx
    register.tsx
  tabs/
    _layout.tsx            — If !authenticated → <Redirect href="/auth/login" />; else <Tabs> with 4 tabs: home, write, moderation, profile
    home.tsx               — Ana Sayfa tab
    write.tsx              — Dedikodu Yaz tab
    moderation.tsx         — Moderasyon tab (visible only for platinum in tab bar; others see it but get gate message)
    profile.tsx            — Profil tab
  subscription.tsx         — Subscription change screen (outside tabs)
  admin/
    _layout.tsx            — Stack layout, superuser guard
    index.tsx              — Admin dashboard
    users.tsx              — User list
    users/
      [userId]/
        index.tsx          — User detail
```

## Navigation

- **Unauthenticated**: Stack with login → register
- **Authenticated**: Bottom tabs (4 tabs):
  1. 🏠 Ana Sayfa (home)
  2. ✏️ Yaz (write)
  3. 🛡️ Moderasyon (moderation) — tab always visible but content gated
  4. 👤 Profil (profile)
- **Outside tabs** (share auth guard from root layout):
  - Subscription screen (pushed from profile)
  - Admin screens (pushed from profile, superuser only)
- Auth state transitions use layout guards with `<Redirect>`, never imperative navigation from auth screens
- Tab bar: moderation tab shows badge with pending count for platinum users
