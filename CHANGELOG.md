# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 25-09-2026

### Added
- **Daily update check** - Once a day (first check 30 seconds after startup), the server asks the UsersConnect check-in service whether a newer version exists. Only the product name and running version are sent; the service counts distinct instances per day using salted hashes with a secret rotated and deleted daily, and never stores IP addresses. Disable with `updateCheck.enabled: false` or `UPDATE_CHECK_ENABLED=false`
- **Update badge and admin notices** - Admins see a badge on the Admin Tools link and a panel on `/admin/users` when an update is available or the service publishes a notice. Notices are plain text with an optional `https` link, and can be dismissed (instance-wide, persisted in Redis)
- **`GET /config/version`** (admin) - Running version and the latest update-check result, for separate frontends
- **`PUT /config/notice/dismissed`** (admin) - Dismiss the current notice
- **`joinedAt` on public user objects** - API responses now include when the account was created, mapped from `User.createdAt`
- **Running version in the startup log**
- **Running version in the footer** - Shown to logged-in users only, so it isn't exposed to automated scanners

### Changed
- **License: MIT → AGPL-3.0** - Applies from this release onward. Versions 1.1.0 and earlier, including their Docker image tags, remain available under MIT; see `LICENSING.md`
- **Admin email changes always reset verification** - The server now resets `isEmailVerified` whenever an admin changes a user's email, regardless of what the client sends, so web, mobile and API clients behave identically. The `isEmailVerified` field is no longer part of the admin edit-user request body
- **Install scripts allowed for `bcrypt` and `unrs-resolver`**
- **Package description** - Now describes what the project is

### Fixed
- **`verifyPassword` returns a public user object** - It previously returned the raw database entity despite being declared to return a `PublicUser`; it now goes through `userToPublic`
- **Documentation corrections** - Removed the claim of unit test coverage (the tests were removed in 1.1.0) and the stale `tests/` entry in the project structure; documented the `/config` endpoints; GitHub links now point to the current `omairsalman03` account
- **Startup failure is no longer reported as success** - If the port is already in use, the server now logs the error and exits instead of logging "Server running"

### Security
- **Cross-site request forgery (CSRF) protection** - State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) are now rejected when their `Origin` header is neither this site nor a configured CORS origin. Since 1.0.4 moved auth cookies to `SameSite=None` for mobile clients, a malicious website could make a logged-in user's browser create posts, comment, like or dislike, replace their profile picture, or trigger verification emails. Actions using `PUT` or `DELETE`, including editing or deleting users and changing admin status, were not affected
- **nodemailer** 8.0.7 → 9.0.6: Fixed GHSA-p6gq-j5cr-w38f. The v9 breaking change only affects TLS validation when fetching remote content (attachment URLs, OAuth2 endpoints, proxy CONNECT), none of which UsersConnect uses, so SMTP behaviour is unchanged
- Resolved **4 npm audit vulnerabilities** (2 high, 2 moderate) via non-breaking `npm audit fix` (no `--force` required)
- **multer** 2.2.0 → 2.4.0 (high): Fixed DoS via crafted multipart field names, file descriptor leak on aborted uploads, file size limit bypass via an async fileFilter race condition, and DoS via oversized array indices in field names (GHSA-wc9g-mxfw-jrwm, GHSA-qfvm-cv95-jqjf, GHSA-qvfw-j98x-7q72, GHSA-535w-7cp7-47q4)
- **nodemailer** 9.0.6 → 9.1.1 (high): Fixed resolveContent() bypassing disableFileAccess/disableUrlAccess with the legacy signature, recipient-domain validation bypasses via IDN/Punycode and RFC 5322 comment parsing, and quadratic-time addressparser DoS (GHSA-8m3c-c648-2xjj, GHSA-wmmp-3585-3rmp, GHSA-cc9r-2j5m-2m83, GHSA-2x7j-588g-ccc2)
- **mysql2** 3.22.3 → 3.24.4 (moderate): Fixed decompression-bomb DoS via unbounded zlib inflate in the compressed protocol handler (GHSA-rgwj-5xj2-c3m3)
- **qs** 6.15.2 → 6.16.0 (moderate): Fixed array-limit bypass via bracket-key comma parsing and DoS via an attacker-controlled isBuffer (GHSA-x5fp-wj9c-mxmx, GHSA-4mjr-xmp4-gh2g)

## [1.1.0] - 14-06-2026

> Note: cross-site cookie support for mobile clients partially landed in 1.0.4; this release extends `sameSite:none` consistently across all authentication flows.

### Added
- **Insecure-context guard on auth pages** - The login, register, and password-reset pages now detect an insecure (non-HTTPS) context via `window.isSecureContext` and disable submission with an explanatory banner instead of failing silently when the `Secure` cookies are rejected by the browser

### Changed
- **`secure` cookie flag now unconditional** - All authentication cookies are set/cleared with `secure: true` regardless of `NODE_ENV`, because `SameSite=None` requires the `Secure` attribute
- **Dependency cleanup** - Removed unused/duplicate packages: `ejs`, `express-session`, `@types/connect-mongo`, `redis`, `mariadb`, and `hbs` (with their associated `@types/*`); the app uses `ioredis`, `mysql2`, and `express-handlebars`
- **`handlebars` declared as a direct dependency** - Previously only transitive, but imported directly in `src/services/emailService.ts`; pinned to the version already resolved under `express-handlebars`
- **Logger honors the config system** - `logging.directory`, `logging.maxFileSize`, and `logging.maxFiles` are now applied via a `configureLogger()` factory (no circular dependency on the config singleton). A relative log directory resolves under the app working directory (`/app/logs` in Docker); an absolute path is honored verbatim
- **Database connection retries honor config** - `connectWithRetry` now uses `database.connectionRetries` and `database.retryDelay` instead of hardcoded values
- **Removed stale internship-era test files** - Cleared `src/tests/` of outdated tests; Jest infrastructure is retained (`passWithNoTests` enabled) for future real tests
- **Documentation & docker-compose examples** - Corrected the log mount path (`./logs:/app/logs`), added a `config.yaml` mount and a named `logs` volume, added an optional CORS environment block, and removed the ignored `PORT` environment variable

### Fixed
- **`sameSite:none` applied consistently across all auth cookies** - Password reset, reset-session, email verification, and email-change flows now use `sameSite: 'none'` everywhere (several previously used `'lax'`)
- **Post-email-verification token downgrade** - The access/refresh tokens re-issued after email verification (and email change) were incorrectly downgraded to `sameSite: 'lax'`, breaking cross-site auth right after verifying; they now remain `sameSite: 'none'`
- **Documentation corrections** - `CONTRIBUTING.md` project structure (`models/` → `entities/`) and the migration command example aligned with the actual npm scripts

### Security
- Resolved **3 npm audit vulnerabilities** (1 high, 2 moderate) via non-breaking `npm audit fix` (no `--force` required)
- **fast-xml-builder** 1.1.5 → 1.2.0 (high): Fixed attribute values with unwanted quotes bypassing malicious/unwanted attribute filtering (GHSA-5wm8-gmm8-39j9) and comment-value regex bypass (GHSA-45c6-75p6-83cc)
- **qs** 6.15.1 → 6.15.2 (moderate): Fixed remotely triggerable DoS where `qs.stringify` crashes with a TypeError on null/undefined entries in comma-format arrays when `encodeValuesOnly` is set (GHSA-q8mj-m7cp-5q26)
- **brace-expansion** 5.0.5 → 5.0.6 (moderate, transitive via nodemon): Fixed large numeric range defeating the documented `max` DoS protection (GHSA-jxxr-4gwj-5jf2)

## [1.0.4] - 27-04-2026

### Changed
- **Cookie Configuration for Mobile Apps** - Changed `sameSite` from `lax` to `none` across all authentication operations to support cross-site requests from mobile applications
- **README** - Updated version badge to 1.0.4

### Fixed
- **npm Dependency Resolution** - Added npm overrides to prevent TypeORM/uuid version cycling during `npm audit fix --force`

### Security
- **TypeORM** → 0.3.28: Fixed SQL injection vulnerabilities (GHSA-fx4w-v43j-vc45, GHSA-q2pj-6v73-8rgj)
- **uuid** → 14.0.0: Fixed buffer bounds check in v3/v5/v6 when buf is provided (GHSA-w5hq-g745-h8pq)
- **npm overrides** added to package.json to enforce secure versions and prevent dependency resolution conflicts

### Technical Details
- Modified cookie settings in:
  - `src/controllers/api/authController.ts` (login, register, logout)
  - `src/controllers/api/userController.ts` (password change, email change)
  - `src/controllers/web/webController.ts` (token refresh)
  - `src/middlewares/auth/isAuthenticated.ts` (token refresh)
- Added `overrides` section to package.json: `{"uuid": "^14.0.0", "typeorm": "^0.3.28"}`

## [1.0.3] - 02-04-2026

### Fixed
- **Comment API Support** - Comments can now be posted via API requests (for separate frontend applications)
- **Comment Service** - Now accepts `commentContent` string instead of raw Comment object, preventing accidental field injection
- **Comment Controller** - Destructures `request.body.content` explicitly; adds `isApiRequest` check to return JSON instead of rendered HTML for API clients
- **Comment Validation** - Validates `request.body.content` directly instead of entire body object

### Security
- Updated npm dependencies to resolve **9 vulnerabilities** (1 critical, 6 high, 1 moderate, 1 low)
- **handlebars** → 4.7.9 (critical): Fixed JS injection via AST type confusion, prototype pollution leading to XSS, property access validation bypass, and DoS via malformed decorator syntax
- **fast-xml-parser** → 5.5.8 (high): Fixed numeric entity expansion bypassing entity expansion limits
- **lodash** → 4.18.1 (high): Fixed code injection via _.template and prototype pollution
- **path-to-regexp** → 8.4.2 (high): Fixed ReDoS via sequential optional groups and multiple wildcards
- **picomatch** → 2.3.2 / 4.0.4 (high): Fixed method injection in POSIX character classes and ReDoS
- **brace-expansion** → 1.1.13 / 2.0.3 (moderate): Fixed zero-step sequence causing process hang
- **nodemailer** → 8.0.4 (low): Fixed SMTP command injection via unsanitized envelope.size parameter

## [1.0.2] - 04-03-2026

### Security
- Updated npm dependencies to resolve 6 vulnerabilities (2 critical, 2 high, 1 moderate, 1 low)
- All packages updated to latest secure versions via `npm audit fix`

## [1.0.1] - 04-03-2026

### Fixed
- **Critical: YAML configuration not applied** - Fixed hardcoded `process.env` calls throughout codebase that bypassed the centralized configuration system
- **S3Service** - Now properly uses `config.s3.*` instead of `process.env.S3_*`
- **EmailService** - Now properly uses `config.smtp.*` instead of `process.env.SMTP_*`
- **Logger** - Now properly uses `config.logging.level` instead of `process.env.LOG_LEVEL`
- **s3Config utility** - Now checks `config.s3` instead of `process.env` for feature detection

**Impact:** YAML-based configuration (`config.yaml`) now works correctly. Previously, even though config.yaml was loaded, services bypassed it by reading environment variables directly, causing YAML settings to be ignored.

## [1.0.0] - 04-03-2026

### Added
- **Like/Dislike System** - Separate dislike button and counter for posts and comments, mutually exclusive with likes
- **Email Verification System** - Optional verification with 6-digit codes, blocks interactions until verified
- **Password Reset via Email** - Secure password recovery flow with email verification codes
- **Email Change Verification** - 3-step process: verify current email, verify new email, update
- **Custom Profile Pictures** - Upload custom avatars via S3 (appears only when S3 is configured)
- **YAML Configuration System** - `config.yaml` file with environment variable overrides, type-safe with startup validation
- **Optional SMTP** - Email features gracefully disabled when SMTP not configured, users can interact immediately
- **CORS Configuration** - Support for multiple origins, configurable methods and headers, enable/disable per deployment
- **TypeORM Migrations** - Auto-sync in development, migrations required in production, automatic on startup
- **First-Time Setup Wizard** - Guided setup at `/setup` for creating admin and configuring S3/SMTP/CORS
- **Email Privacy Toggle** - Users can show/hide email on profile (requires verification)
- **Verification Badges** - Visual indicators for verified email addresses
- **Environment Type Safety** - Complete type definitions for environment variables in `environment.d.ts`
- **Comprehensive `.env.example`** - All configuration options documented with examples
- **Winston Logging** - Configurable log levels with file rotation

### Changed
- **Profile Edit Page** - Separated into independent sections: profile picture (if S3), name, email, password, privacy
- **Profile Edit Sections** - Each section has its own save button for independent updates
- **Password Change** - Now requires current password + new password + confirmation
- **Admin User Edit** - Separated into independent sections with individual save buttons
- **Admin Password Change** - Single password field, no confirmation required for admin-initiated changes
- **Email Verification on Edit** - Admin changing user email resets verification status
- **Pagination Edge Cases** - Better handling and messages for out-of-bounds and empty states
- **Feed Out of Bounds** - Shows "You've gone too far!" message, hides previous button
- **Own Profile No Posts** - Shows "You didn't make any posts yet" with link to create
- **Own Profile Out of Bounds** - Shows "You've gone too far!" with link to post more
- **Other Profile No Posts** - Shows "[Name] has no posts yet"
- **Other Profile Out of Bounds** - Shows "You've gone too far!" with link to first page
- **Post Image Display** - Fixed centering issues on mobile devices
- **Docker Port** - Internal port hardcoded to 3000 to match `EXPOSE` directive

### Fixed
- **Redis Cache Invalidation** - Fixed double-prefixing bug where `keys()` returns prefixed keys but `del()` expects unprefixed
- **Post Image Centering** - Removed padding conflicts causing mobile display issues
- **Startup Validation** - Clear error messages for missing required configuration

### Security
- **Email Verification Security** - Session tokens for email change, duplicate prevention
- **Password Verification** - Current password required for all password changes
- **Email Change Security** - Verify both old and new email addresses

## [1.0.0-rc.2] - 19-12-2025

### Changed
- Increased file size limit for image uploads to 10 MB (from 5 MB)

## [1.0.0-rc.1] - 18-12-2025

### Added
- Optional S3 image uploads (AWS, MinIO, DigitalOcean, Cloudflare R2)
- Production-ready deployment with Gravatar profiles

### Fixed
- Navigation hyperlinks
- Post/comment edit mode

[1.2.0]: https://github.com/omairsalman03/UsersConnect/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/omairsalman03/UsersConnect/compare/v1.0.4...v1.1.0
[1.0.4]: https://github.com/omairsalman03/UsersConnect/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/omairsalman03/UsersConnect/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/omairsalman03/UsersConnect/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/omairsalman03/UsersConnect/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/omairsalman03/UsersConnect/compare/v1.0.0-rc.2...v1.0.0
[1.0.0-rc.2]: https://github.com/omairsalman03/UsersConnect/compare/v1.0.0-rc.1...v1.0.0-rc.2
[1.0.0-rc.1]: https://github.com/omairsalman03/UsersConnect/releases/tag/v1.0.0-rc.1