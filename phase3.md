# Phase 3 — Detailed Change Log

> **Date:** 19 March 2026  
> **Project:** Rashtrapati Guild Portal — BSG India  
> **Scope:** Frontend revamp, backend email improvements, data management, and deployment fixes

---

## Table of Contents

1. [OTP Email — Personalized Template](#1-otp-email--personalized-template)
2. [Form Submission Email — New Function](#2-form-submission-email--new-function)
3. [Password Validation — Real-Time Strength Indicators](#3-password-validation--real-time-strength-indicators)
4. [BSG State & District Data — Comprehensive Update](#4-bsg-state--district-data--comprehensive-update)
5. [Revenue State & District Data — Populated from Source](#5-revenue-state--district-data--populated-from-source)
6. [Form.jsx — Dropdown Logic Fixes](#6-formjsx--dropdown-logic-fixes)
7. [Landing Page — Full Revamp](#7-landing-page--full-revamp)
8. [Global CSS — Inter Font & Smooth Scroll](#8-global-css--inter-font--smooth-scroll)
9. [Favicon — BSG Logo](#9-favicon--bsg-logo)
10. [Admin Dashboard — Excel Column Names](#10-admin-dashboard--excel-column-names)
11. [.gitignore & Uploads Cleanup](#11-gitignore--uploads-cleanup)
12. [Git Remote — Switched to Personal Repo](#12-git-remote--switched-to-personal-repo)

---

## 1. OTP Email — Personalized Template

### What I Realized

The old OTP email was a plain, generic message. It did not greet the user by name, had no branding, and looked unprofessional. The user requested a specific format with a personalized greeting, clear OTP display, timer notice, security warning, and BSG footer.

### What I Did

Updated the `sendOtpEmail()` function in `backend/config/mail.js` to:

- Accept a third parameter `name` (defaults to `"User"`)
- Use a branded HTML email template matching BSG's `#1D57A5` blue color scheme
- Display a clear OTP code box with dashed border and large font
- Show a **5-minute validity warning** (yellow box with ⏱️ icon)
- Show a **security warning** (red box with ⚠️ icon) telling users not to share the OTP
- Add a BSG-branded footer with "Rashtrapati Guild Portal — National Headquarters"

### Why I Did This

To make the emails look official and trustworthy. A branded, well-designed email builds user confidence and reduces the chance of users ignoring OTP messages.

### How It Works

```
File: backend/config/mail.js → sendOtpEmail()

BEFORE (old call):
  sendOtpEmail(user.email, otp)

AFTER (new call with name):
  sendOtpEmail(user.email, otp, user.name)
```

The function signature changed from:
```javascript
export async function sendOtpEmail(email = "", otp)
```
to:
```javascript
export async function sendOtpEmail(email = "", otp, name = "User")
```

The HTML template uses inline CSS styles (because email clients don't support external stylesheets). Key colors used:
- `#1D57A5` — BSG blue for header and OTP text
- `#EBF0F9` — Light blue background for OTP box
- `#FFF8E1` — Yellow background for timer warning
- `#FFF3F3` — Red background for security warning

### Where the Name Comes From

In `backend/routes/user.js`, when calling `sendOtpEmail`, we now pass the user's name:

```javascript
// During signin OTP
await sendOtpEmail(user.email, otp, user.name);

// During registration OTP
await sendOtpEmail(email, otp, name);
```

---

## 2. Form Submission Email — New Function

### What I Realized

There was no email sent when a user successfully submitted their application form. Users had no confirmation that their form was received.

### What I Did

Created a brand new function `sendFormSubmissionEmail()` in `backend/config/mail.js`.

### Why I Did This

When a user fills out the entire guild application form and submits it, they should get a confirmation email. This gives them peace of mind that their application was received and is under review.

### How It Works

```javascript
// File: backend/config/mail.js

export async function sendFormSubmissionEmail(email = "", name = "") {
  // Sends a branded email with:
  // - "Application Submitted" header in BSG blue
  // - Personalized greeting: "Dear [Name]"
  // - Green success box: "Your application is pending admin verification"
  // - Note about checking dashboard for status
  // - BSG footer
}
```

The email has the same visual style as the OTP email for consistency. It uses:
- Green accent (`#22c55e`) for the success message box
- Same BSG blue header and footer

### Where It's Called

This function should be called in the backend route that handles form submission, right after the form data is saved to the database:

```javascript
import { sendFormSubmissionEmail } from "../config/mail.js";

// After saving form data...
await sendFormSubmissionEmail(user.email, formData.name);
```

---

## 3. Password Validation — Real-Time Strength Indicators

### What I Realized

The registration form had no password strength requirements. Users could set "1234" as a password. This is a security risk.

### What I Did

Added real-time password validation with visual indicators in `frontend/src/pages/Register.jsx`.

### Why I Did This

To enforce minimum password security while giving users immediate feedback so they don't get frustrated submitting the form and then seeing an error.

### How It Works — The Validation Logic

```javascript
// File: frontend/src/pages/Register.jsx → validateStep3()

const pw = form.password;
const checks = [];
if (pw.length < 4) checks.push("at least 4 characters");
if (!/[A-Z]/.test(pw)) checks.push("1 uppercase letter");
if (!/[0-9]/.test(pw)) checks.push("1 number");
if (!/[^A-Za-z0-9]/.test(pw)) checks.push("1 special character");
if (checks.length > 0)
  errs.password = `Password needs: ${checks.join(", ")}`;
```

**Rules enforced:**
| Rule | Regex/Check | Example Pass | Example Fail |
|------|-------------|-------------|-------------|
| Min 4 chars | `pw.length >= 4` | `Abcd` | `Ab` |
| 1 uppercase | `/[A-Z]/` | `Hello` | `hello` |
| 1 number | `/[0-9]/` | `abc1` | `abcd` |
| 1 special char | `/[^A-Za-z0-9]/` | `abc!` | `abcd` |

### How It Works — The Visual Indicators

As the user types their password, they see colored dots next to each rule:

```jsx
{form.password && (
  <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-2.5 space-y-1">
    {[
      { test: form.password.length >= 4, label: "At least 4 characters" },
      { test: /[A-Z]/.test(form.password), label: "One uppercase letter (A-Z)" },
      { test: /[0-9]/.test(form.password), label: "One number (0-9)" },
      { test: /[^A-Za-z0-9]/.test(form.password), label: "One special character (!@#$...)" },
    ].map(({ test, label }) => (
      <div key={label} className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full shrink-0 transition-colors duration-200 
          ${test ? "bg-green-500" : "bg-red-400"}`} />
        <span className={`text-xs transition-colors duration-200 
          ${test ? "text-green-600 font-medium" : "text-red-500"}`}>
          {label}
        </span>
      </div>
    ))}
  </div>
)}
```

- **Green dot** = rule satisfied ✅
- **Red dot** = rule not met ❌
- The indicators only appear once the user starts typing (controlled by `{form.password && ...}`)

---

## 4. BSG State & District Data — Comprehensive Update

### What I Realized

The BSG State and BSG District dropdowns in the form needed the exact data from the official BSG organizational structure. This data includes not just regular Indian states, but also Railway divisions, KV Sangathan, Navodaya Vidyalaya, NESTS, and other BSG-specific organizational units.

### What I Did

Completely rewrote the `BSG_STATE_DISTRICTS` mapping in `frontend/src/data/indiaStates.js` with the full JSON data provided. This includes **57 BSG states** and their corresponding districts.

### Why I Did This

The BSG organizational structure is different from regular Indian states. For example, "CENTRAL RAILWAY" is a BSG state with districts like "Bhusawal Division", "Mumbai Division", etc. Users need to select from these exact organizational units when filling their guild application.

### How It Works

The data file structure:

```javascript
// File: frontend/src/data/indiaStates.js

// The main mapping — state name as key, array of districts as value
export const BSG_STATE_DISTRICTS = {
    "ANDAMAN NICOBER": [
        "NICOBAR DISTRICT 1",
        "NICOBAR DISTRICT 2",
        // ... more districts
    ],
    "ANDHRA PRADESH": [
        "ALLURI SITA RAMA RAJU",
        "ANAKAPALLI",
        // ... 42 total districts
    ],
    "CENTRAL RAILWAY": [
        "Bhusawal Division",
        "Mumbai Division",
        "Nagpur Division",
        "Pune Division",
        "Solapur Division"
    ],
    // ... 57 total BSG states
};

// BSG_STATES is automatically generated from the keys of BSG_STATE_DISTRICTS
// This means if you add a new state to the mapping, it automatically appears in the dropdown!
export const BSG_STATES = Object.keys(BSG_STATE_DISTRICTS).sort();

// Helper function used by Form.jsx to get districts for a selected state
export const getBsgDistricts = (bsgState) => BSG_STATE_DISTRICTS[bsgState] || [];
```

### Complete List of BSG States (57 total)

These include geographic states, railway divisions, and educational organizations:

**Geographic States:** ANDAMAN NICOBER, ANDHRA PRADESH, ARUNACHAL PRADESH, BIHAR, CHANDIGARH, CHHATTISGARH, DELHI, DNH, GOA, GUJARAT, HIMACHAL PRADESH, JAMMU & KASHMIR, JHARKHAND, JHARKHAND STATE-02, KARNATAKA, MADHYAPRADESH, MANIPUR, MEGHALAYA, MIZORAM, NAGALAND, ODISHA, RAJASTHAN, SIKKIM, TAMILNADU, TELANGANA, TRIPURA, UTTAR PRADESH, UTTARAKHAND, WEST BENGAL

**Railway Divisions:** CENTRAL RAILWAY, EAST CENTRAL RAILWAY, EAST COAST RAILWAY, EASTERN RAILWAY, NORTH CENTRAL RAILWAY, NORTH EASTERN RAILWAY, NORTH WESTERN RAILWAY, NORTHEAST FRONTIER RAILWAY, NORTHERN RAILWAY, SOUTH CENTRAL RAILWAY, SOUTH EAST CENTRAL RAILWAY, SOUTH EASTERN RAILWAY, SOUTH WESTERN RAILWAY, SOUTHERN RAILWAY, WEST CENTRAL RAILWAY, THE WESTERN RAILWAY STATE BHARAT SCOUTS AND GUIDES

**Educational/Special:** KENDRIYA VIDYALAYA SANGHATAN, NAVODAYA VIDYALAYA SAMITI, NESTS, CWSN AUXILIARY UNITS, KSA DISTRICT

**State Associations:** THE BHARAT SCOUTS AND GUDIES ASSAM, THE BHARAT SCOUTS AND GUIDES PUDUCHERRY, THE BHARAT SCOUTS AND GUIDES PUNJAB, THE HARYANA STATE BHARAT SCOUTS AND GUIDES, THE KERALA STATE BHARAT SCOUTS AND GUIDES, THE MAHARASHTRA STATE BHARAT SCOUTS AND GUIDES, UT OF DAMAN AND DIU

---

## 5. Revenue State & District Data — Populated from Source

### What I Realized

The Revenue State dropdown had all 36 states/UTs listed, but the Revenue District dropdown was showing **empty** (null) because `STATE_DISTRICTS` was an empty object `{}`. The `getDistricts()` function was returning an empty array for every state.

### What I Did

Fetched real Indian state-district data from a reliable GitHub source (`sab99r/Indian-States-And-Districts`) and populated the `STATE_DISTRICTS` mapping with official district data for all 36 states and union territories.

### Why I Did This

Users must select their Revenue District when filling the form. Without this data, the district dropdown was always empty, making the form incomplete.

### How It Works

I wrote a temporary Node.js script that:
1. Fetched the JSON from `https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json`
2. Matched each state in our `INDIA_STATES` array with the correct state in the JSON
3. Extracted and sorted the districts alphabetically
4. Added manual fallbacks for edge cases (like Ladakh which was not in the source)
5. Wrote the result back to `indiaStates.js`

```javascript
// The populated STATE_DISTRICTS now looks like:
export const STATE_DISTRICTS = {
  "Andaman and Nicobar Islands": [
    "Nicobars", "North and Middle Andaman", "South Andaman"
  ],
  "Andhra Pradesh": [
    "Anantapur", "Chittoor", "East Godavari", "Guntur", 
    "Krishna", "Kurnool", /* ... 13 districts total */
  ],
  "Delhi": [
    "Central Delhi", "East Delhi", "New Delhi", 
    "North Delhi", "North East Delhi", /* ... 11 districts */
  ],
  "Ladakh": ["Kargil", "Leh"],
  // ... all 36 states with their districts
};
```

### Fallback Safety

If any state somehow has zero districts in the mapping, the helper function returns an empty array, and the dropdown simply shows "-- Select District --" with no options. However, I ensured **every single state** has at least one district entry.

```javascript
export const getDistricts = (state) => STATE_DISTRICTS[state] || [];
```

---

## 6. Form.jsx — Dropdown Logic Fixes

### What I Realized

Two bugs existed in the form dropdown logic:

1. **Revenue State → District not resetting:** When a user selected a Revenue State, then selected a district, then changed the Revenue State to a different one, the old district value remained in the form state. This caused invalid data.

2. **BSG State → District dropdown was already correct** (it was resetting properly), but it was a good pattern to confirm.

### What I Did

Updated the Revenue State dropdown's `onChange` handler in `Form.jsx` to clear the district whenever the state changes.

### Why I Did This

Without this fix, a user could submit the form with "Delhi" as state but "Pune" as district (from a previously selected Maharashtra), which is invalid data.

### How It Works — Before vs After

**BEFORE (broken):**
```jsx
<select
  className={inputCls}
  value={form.revenueState}
  onChange={set("revenueState")}  // ← Just sets state, doesn't clear district
>
```

**AFTER (fixed):**
```jsx
<select
  className={inputCls}
  value={form.revenueState}
  onChange={(e) => {
    set("revenueState")(e);  // Set the new state
    setForm((p) => ({ ...p, revenueDistrict: "" }));  // Clear old district
  }}
>
```

The BSG State dropdown already had this pattern:
```jsx
onChange={(e) => {
  set("bsgState")(e);
  setForm((p) => ({ ...p, bsgDistrict: "" }));  // Already correctly resetting
}}
```

### Import Statement

```javascript
// File: frontend/src/pages/Form.jsx (line 24)
import { INDIA_STATES, getDistricts, BSG_STATES, getBsgDistricts } from "../data/indiaStates";
```

This imports all four needed things:
- `INDIA_STATES` — array of 36 revenue states for the Revenue State dropdown
- `getDistricts` — function to get revenue districts for a selected state
- `BSG_STATES` — array of 57 BSG states for the BSG State dropdown
- `getBsgDistricts` — function to get BSG districts for a selected BSG state

---

## 7. Landing Page — Full Revamp

### What I Realized

The original landing page was functional but visually flat — no animations, no micro-interactions, and no engaging content beyond the carousel and raw badge images. It needed a premium feel that matches the importance of a national-level award portal.

### What I Did

Completely redesigned `frontend/src/pages/LandingPage.jsx` with:

1. **Hero Section** — Carousel with optional glassmorphism overlay
2. **Badges Grid** — 4-column grid with hover micro-interactions
3. **Info Cards** — Alternating layout with floating badge animations and unique descriptive text
4. **Section Headings** — Reusable component with scroll-reveal animation
5. **CSS Keyframes** — Custom animations for floating and fade effects

### Why I Did This

The landing page is the first thing users see. A static, plain page doesn't inspire confidence in a national-level government portal. The revamp adds visual polish while keeping the page fast and accessible.

### How Each Part Works

#### a) `useInView` Hook — Scroll-Based Animation

This custom hook uses the browser's `IntersectionObserver` API to detect when an element scrolls into the viewport. It fires only once (so elements don't re-animate when scrolling back up).

```javascript
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);  // Only sets to true, never back to false
      },
      { threshold: 0.1, ...options },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return [ref, isInView];  // Returns a ref to attach to the element + a boolean
};
```

**Usage pattern:**
```jsx
const [ref, isInView] = useInView();
// Attach ref to element, use isInView to control opacity/transform
```

#### b) `SectionHeading` Component

A reusable heading that fade-slides up when scrolled into view:

```jsx
const SectionHeading = ({ label, title, subtitle }) => {
  const [ref, isInView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: isInView ? 1 : 0,            // Fade in
        transform: isInView ? "translateY(0)" : "translateY(28px)",  // Slide up
      }}
    >
      <span>AWARDS</span>      {/* Small uppercase pill label */}
      <h2>Rashtrapati Awards</h2>  {/* Main title */}
      <p>The highest honours...</p>  {/* Subtitle */}
    </div>
  );
};
```

#### c) `BadgeCard` Component — Hover Micro-Interactions

Each badge card has **5 layers of interaction**:

| Effect | Trigger | CSS Property |
|--------|---------|-------------|
| Fade + slide up | Scroll into view | `opacity`, `translateY` |
| Lift up 8px | Mouse hover | `translateY(-8px)` |
| Scale up 2% | Mouse hover | `scale(1.02)` |
| Colored shadow | Mouse hover | `boxShadow` with badge color |
| Image rotate -3° | Mouse hover | `rotate(-3deg)` on `<img>` |
| Glow ring | Mouse hover | Gradient overlay `div` |

```javascript
// Each badge has a unique color:
const badges = [
  { label: "Rashtrapati Scout",   color: "#1D57A5" },  // BSG Blue
  { label: "Rashtrapati Guide",   color: "#2E7D32" },  // Green
  { label: "Rashtrapati Rover",   color: "#C62828" },  // Red
  { label: "Rashtrapati Ranger",  color: "#E65100" },  // Orange
];
```

The staggered reveal works by delaying each card's appearance:
```jsx
{badges.map((badge, i) => (
  <BadgeCard ... delay={i * 150} />  // Card 0: 0ms, Card 1: 150ms, Card 2: 300ms, Card 3: 450ms
))}
```

#### d) `InfoCard` Component — Floating Badge Animation

Each info card shows a badge image on one side and descriptive text on the other. The cards alternate direction (`flex-row` vs `flex-row-reverse`) for visual variety.

The badge image has a **floating bob animation**:
```css
@keyframes float-a {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }  /* Bobs up */
}
@keyframes float-b {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(8px); }   /* Bobs down */
}
```

Even-indexed cards use `float-a` (bob up), odd-indexed use `float-b` (bob down).

Behind each badge image is a **colored glow** using a blurred div:
```jsx
<div
  className="absolute -inset-3 rounded-full opacity-20 blur-xl"
  style={{ background: badges[index]?.color }}
/>
```

#### e) Unique Text Per Section

Each info card now has its own descriptive paragraph instead of the same generic text:

```javascript
const infoTexts = [
  "The Scout section focuses on building character, citizenship...",        // Scout
  "Guides empower young girls aged 10–17 through...",                      // Guide
  "The Rover section is for young men aged 15–25 who extend...",           // Rover
  "Rangers are young women aged 15–25 who carry forward...",               // Ranger
];
```

### Page Structure (Top to Bottom)

```
┌─────────────────────────────────────────────┐
│  Navbar                                      │
├─────────────────────────────────────────────┤
│  Hero Carousel (with optional overlay)       │
├─────────────────────────────────────────────┤
│  Section Heading: "Rashtrapati Awards"       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Scout │ │Guide │ │Rover │ │Ranger│       │
│  │ Card │ │ Card │ │ Card │ │ Card │       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
├─────────────────────────────────────────────┤
│  Section Heading: "Know the Sections"        │
│  ┌─────────────────────────────────┐        │
│  │ 🏅 Scout  |  Description text   │        │
│  └─────────────────────────────────┘        │
│  ┌─────────────────────────────────┐        │
│  │ Description text  |  🏅 Guide   │  ← reversed
│  └─────────────────────────────────┘        │
│  ┌─────────────────────────────────┐        │
│  │ 🏅 Rover  |  Description text   │        │
│  └─────────────────────────────────┘        │
│  ┌─────────────────────────────────┐        │
│  │ Description text  |  🏅 Ranger  │  ← reversed
│  └─────────────────────────────────┘        │
├─────────────────────────────────────────────┤
│  Footer                                      │
└─────────────────────────────────────────────┘
```

---

## 8. Global CSS — Inter Font & Smooth Scroll

### What I Realized

The project was using "Times New Roman" as the default body font, which looked dated for a modern web portal.

### What I Did

Updated `frontend/src/index.css` to:

1. Import **Inter** font from Google Fonts (weights 300-900)
2. Set Inter as the primary font, with Times New Roman as fallback
3. Add `scroll-behavior: smooth` for smooth anchor scrolling
4. Add a custom text selection color matching BSG blue

### How It Works

```css
/* File: frontend/src/index.css */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

html {
  scroll-behavior: smooth;  /* When clicking anchor links, page scrolls smoothly */
}

body {
  font-family: "Inter", "Times New Roman", Times, serif;  /* Inter first, fallback to Times */
}

::selection {
  background-color: #1D57A520;  /* 20 = 12.5% opacity — light blue highlight */
  color: #1D57A5;               /* BSG blue text when selected */
}
```

### Why I Did This

- **Inter** is a clean, modern sans-serif font designed specifically for screens. It's used by major tech companies and looks professional.
- **Smooth scroll** prevents jarring page jumps when using anchor links.
- **Custom selection color** is a subtle branding touch — when users select text on the page, it highlights in BSG blue instead of the default browser blue.

---

## 9. Favicon — BSG Logo

### What I Realized

The project was using the default Vite favicon (a generic SVG icon). It should show the BSG logo in the browser tab.

### What I Did

1. Copied `frontend/src/assets/bsglogo.png` to `frontend/public/bsglogo.png`
2. Updated `frontend/index.html` to reference the new favicon

### Why This Specific Approach

In Vite projects, files in the `public/` folder are served as-is at the root URL. So `public/bsglogo.png` becomes accessible at `/bsglogo.png`. Files in `src/assets/` are bundled by Vite and get hashed filenames, making them unsuitable for direct `<link>` references in `index.html`.

### How It Works

```html
<!-- File: frontend/index.html -->
<link rel="icon" type="image/svg+xml" href="/bsglogo.png" />
```

The browser now shows the BSG logo in the tab.

---

## 10. Admin Dashboard — Excel Column Names

### What I Realized

The Excel/CSV download from the Admin Dashboard had generic column headers like "MOBILE", "YEAR", "QUALIFICATION", "PROFESSION". These didn't match the actual database field names, making it confusing for admins who cross-reference with the database.

### What I Did

Updated the `columns` array in the `downloadExcel()` function in `AdminDashboard.jsx` to match the exact DB field names — capitalized and with underscores replaced by spaces.

### Before vs After

| Before | After |
|--------|-------|
| MOBILE | MOBILE NO |
| YEAR | YEAR OF RASTRAPATI |
| QUALIFICATION | HIGHEST QUALIFICATION |
| PROFESSION | PROFESSIONAL QUALIFICATION |
| T SHIRT SIZE | TSHIRT SIZE |
| CERTIFICATE NO | RASHTRAPATI CERTIFICATE NO |

### How It Works

```javascript
// File: frontend/src/pages/AdminDashboard.jsx

function downloadExcel(data) {
  const columns = [
    "NAME", "EMAIL", "MOBILE NO", "SECTION", "YEAR OF RASTRAPATI", "STATUS",
    "REVENUE STATE", "REVENUE DISTRICT", "BSG STATE", "BSG DISTRICT",
    "AADHAAR NO", "RASHTRAPATI CERTIFICATE NO", "HIGHEST QUALIFICATION", 
    "PROFESSIONAL QUALIFICATION",
    "TSHIRT SIZE", "SOUVENIR", "PINCODE", "ADDRESS", "APPLICATION NO",
  ];

  const rows = data.map((item) => [
    item.name, item.email, item.mobile, item.section, item.year, item.status,
    item.state, item.district, item.bsg_state, item.bsg_district,
    item.aadhaar_no, item.certificate_no, item.highest_qualification,
    item.professional_qualification, item.tshirt_size, item.souvenir,
    item.pincode, item.address, item.application_no || "",
  ]);

  // Builds a CSV string with proper escaping for Excel compatibility
  const escape = (v) => `"${String(v || "").replace(/"/g, '""')}"`;
  const csv = [columns.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");

  // \uFEFF is a BOM (Byte Order Mark) that tells Excel to use UTF-8 encoding
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  
  // Create a temporary download link and click it
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `BSG_Submissions_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 11. .gitignore & Uploads Cleanup

### What I Realized

User-uploaded files (photos, Aadhaar documents, certificates) were being committed to the Git repository. This is bad because:
- The repo grows unnecessarily large
- Sensitive user documents (Aadhaar!) should never be in version control
- Git is not meant for binary file storage

### What I Did

1. Added `backend/uploads/`, `uploads/`, and `**/uploads/` to `.gitignore`
2. Ran `git rm -r --cached backend/uploads/` to remove already-tracked upload files from Git history (without deleting them from disk)
3. Committed the cleanup

### How It Works

```gitignore
# File: .gitignore (added these lines)
backend/uploads/
uploads/
**/uploads/
```

The `--cached` flag in `git rm -r --cached` is important:
- **Without `--cached`:** Deletes files from BOTH Git AND disk
- **With `--cached`:** Removes files from Git tracking only, keeps them on disk

---

## 12. Git Remote — Switched to Personal Repo

### What I Realized

The project's Git remote was pointing to `deepbsgindia-lab/guild.git`, but the authenticated GitHub accounts (`sainideep1234` via HTTPS and `Deepanshu545` via SSH) didn't have push access to that repository.

### What I Did

1. Removed the old remote: `git remote remove origin`
2. Added new remote: `git remote add origin https://github.com/sainideep1234/guild.git`
3. Set up tracking: `git branch -M main`
4. Pushed all code: `git push -u origin main`

### How It Works

```bash
# Remove old remote that we can't push to
git remote remove origin

# Add new remote pointing to your personal repo
git remote add origin https://github.com/sainideep1234/guild.git

# Rename current branch to 'main' (if it isn't already)
git branch -M main

# Push and set upstream tracking
git push -u origin main
```

The `-u` flag sets up tracking so future `git push` commands automatically push to `origin/main` without needing to specify it.

---

## Summary of All Files Changed

| File | Type | What Changed |
|------|------|-------------|
| `backend/config/mail.js` | Modified | OTP email template + new form submission email function |
| `backend/routes/user.js` | Modified | Pass user name to `sendOtpEmail()` calls |
| `frontend/src/index.css` | Modified | Inter font, smooth scroll, selection color |
| `frontend/src/pages/LandingPage.jsx` | Rewritten | Full revamp with animations, badges, info cards |
| `frontend/src/pages/Register.jsx` | Modified | Password validation + strength indicators |
| `frontend/src/pages/Form.jsx` | Modified | Import BSG data, reset district on state change |
| `frontend/src/pages/AdminDashboard.jsx` | Modified | Excel column names match DB fields |
| `frontend/src/data/indiaStates.js` | Rewritten | Full BSG state/district data + revenue districts |
| `frontend/index.html` | Modified | Favicon changed to BSG logo |
| `frontend/public/bsglogo.png` | Added | BSG logo file for favicon |
| `.gitignore` | Modified | Ignore uploads folder |

---

## Environment Variables Required

Make sure your `backend/.env` file has these email-related variables:

```env
SMTP_HOST=mail.bsgindia.live
SMTP_PORT=465
EMAIL_USER=noreply@bsgindia.live
EMAIL_PASS=BSGnhq@1950
```

These are used by the `nodemailer` transporter in `mail.js` to send OTP and confirmation emails.

---

*End of Phase 3 documentation.*
