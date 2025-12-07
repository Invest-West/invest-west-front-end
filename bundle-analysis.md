# Bundle Analysis Report

## Current Bundle Size

| File | Size (gzipped) | Status |
|------|----------------|--------|
| main.js | **772.01 kB** | CRITICAL - Should be <250kB |
| main.css | 26.48 kB | Acceptable |
| react-player chunks | ~18 kB total | OK (already code-split) |

**Total JS payload: ~790 kB gzipped**

## Top Dependencies by Disk Size

| Package | Disk Size | Impact |
|---------|-----------|--------|
| @firebase (SDK) | 110 MB | HIGH - loads auth, database, storage synchronously |
| @material-ui | 40 MB | MEDIUM - tree-shaking helps but icons are large |
| firebase | 19 MB | HIGH - bundled with @firebase |
| bootstrap | 4.6 MB | MEDIUM - CSS loaded from CDN but JS bundled |
| react-quill | 3.4 MB | HIGH - loaded on all routes, only needed for editor |
| react-dom | 2.9 MB | Required |
| react-bootstrap | 1.9 MB | MEDIUM |
| react-player | 1.6 MB | LOW - already code-split |

## Root Causes

### 1. No Code Splitting (Critical)
- **30 routes** defined in `src/router/router.tsx`
- ALL page components imported synchronously at module load
- Components loaded: IssuerDashboard, InvestorDashboard, AdminDashboard, CreateProject, ProjectDetails, ProfilePages, SignIn, SignUp, Front, GroupDetails, etc.

### 2. Firebase Loaded Synchronously
```javascript
// src/firebase/firebaseApp.jsx - ALL loaded on app start
import firebase from 'firebase/app';
import 'firebase/auth';      // ~200kB
import 'firebase/database';  // ~100kB
import 'firebase/storage';   // ~50kB
```

### 3. 40+ Redux Reducers
All reducers combined at startup in `src/redux-store/reducers/index.tsx`:
- New TypeScript reducers (14)
- Legacy JavaScript reducers (26)
- No reducer code-splitting

### 4. Render-Blocking External Resources
`public/index.html` loads these before first paint:
- Google Fonts (4 font families)
- Font Awesome CSS (full library)
- Bootstrap CSS (from CDN)
- Quill CSS (from CDN)

No `preconnect` or `dns-prefetch` hints.

### 5. Heavy Components Loaded Globally
- `react-quill` (rich text editor) - only needed on CreateProject
- `react-json-view` - only needed in admin JSON compare dialog
- `react-avatar-editor` - only needed in profile image editing

## Recommended Optimizations

### Phase 2: Code Splitting (Estimated Impact: -300kB)
- Implement `React.lazy()` for all page components
- Add Suspense boundaries with loading fallbacks
- Split routes into chunks by user role

### Phase 3: Firebase Optimization (Estimated Impact: -100kB)
- Lazy load firebase/storage (only needed for uploads)
- Consider firebase/database dynamic import for specific features

### Phase 4: Redux Optimization
- Add production check for DevTools
- Consider lazy-loading feature-specific reducers

### Phase 5: Component Optimization
- Identify re-render issues with componentDidUpdate patterns
- Add React.memo/PureComponent where appropriate

### Phase 6: Asset Optimization (Estimated Impact: -50kB)
- Add preconnect hints for external domains
- Defer non-critical CSS
- Font subsetting for Google Fonts

## Route Inventory

| Route | Component | Priority |
|-------|-----------|----------|
| / | Front | High - Landing page |
| /groups/:groupUserName | Front | High |
| /groups/:groupUserName/signin | SignInNew | High |
| /groups/:groupUserName/signup/:id? | SignUpNew | High |
| /groups/:groupUserName/admin | AdminDashboard | Medium |
| /groups/:groupUserName/dashboard/issuer | IssuerDashboard | Medium |
| /groups/:groupUserName/dashboard/investor | InvestorDashboard | Medium |
| /groups/:groupUserName/create-offer | CreateProject | Low |
| /groups/:groupUserName/projects/:projectID | ProjectDetails | Medium |
| /groups/:groupUserName/view-profile/:userID | ProfilePageViewOnly | Low |
| /groups/:groupUserName/edit-profile/:userID | ProfilePageEditable | Low |
| /groups/:groupUserName/view-group-details/:viewedGroupUserName | GroupDetails | Low |
| /groups/:groupUserName/resources/:resourceName | ResourceDetail | Low |
| /groups/:groupUserName/contact-us | ContactUs | Low |
| /groups/:groupUserName/help | HelpPage | Low |
| /privacy-policy | PrivacyPolicyPage | Low |
| /terms-of-use | TermsOfUsePage | Low |
| /risk-warning-footer | RiskWarningPage | Low |
| /create-project-terms-and-conditions | CreatePitchTermsAndConditionsPage | Low |
| /marketing-preferences | MarketingPreferencesPage | Low |
| /auth/action | ResetPassword | Low |
| /error/404 | PageNotFound | Low |

**Total: 30+ route definitions (many with group/non-group variants)**
