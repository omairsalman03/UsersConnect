# UsersConnect 🌐

A modern full-stack social media platform built with Node.js, Express, and TypeScript. Create posts with optional images, comment, like/dislike, and connect with users in a responsive interface.

Initially built during summer field training at [AsalTech](https://asaltech.com/) under professional mentorship, with continued development thereafter.

**Live Version:** [https://usersconnect.cloudomair.org/](https://usersconnect.cloudomair.org/)  
**Docker Hub:** [omairsalman/usersconnect](https://hub.docker.com/r/omairsalman/usersconnect)

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/omairsalman03/UsersConnect/releases)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Docker Pulls](https://img.shields.io/docker/pulls/omairsalman/usersconnect)](https://hub.docker.com/r/omairsalman/usersconnect)
[![Docker Image Size](https://img.shields.io/docker/image-size/omairsalman/usersconnect/latest?label=image%20size)](https://hub.docker.com/r/omairsalman/usersconnect)
[![GitHub Stars](https://img.shields.io/github/stars/omairsalman03/UsersConnect?style=social)](https://github.com/omairsalman03/UsersConnect/stargazers)
[![Live Demo](https://img.shields.io/badge/demo-online-success?logo=google-chrome&logoColor=white)](https://usersconnect.cloudomair.org/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Why HTTPS is Required](#why-https-is-required)
- [Configuration](#️-configuration)
- [S3 Image Uploads (Optional)](#️-s3-image-uploads-optional)
- [Update Check](#-update-check)
- [Docker Deployment](#-docker-deployment)
- [First-Time Setup](#-first-time-setup)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [AWS S3 Setup Tutorial](#️-aws-s3-setup-tutorial)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features
- 🔐 **Secure Authentication** - JWT-based auth with access/refresh token pattern
- 📝 **Post Management** - Create, edit, and delete posts with rich text content
- 💬 **Interactive Comments** - Nested comment system with real-time updates
- 👍 **Social Engagement** - Like and dislike posts and comments (separate counters)
- 👤 **User Profiles** - Customizable profiles with Gravatar integration
- 🔄 **Real-time Feed** - Paginated feed with latest posts
- 📊 **Profile Statistics** - Track post likes/dislikes and comment engagement

### User Management
- ✉️ **Email Verification** - Optional verification system with 6-digit codes (requires SMTP)
- 🔑 **Password Reset** - Secure password recovery via email (requires SMTP)
- ✏️ **Enhanced Profile Editing** - Independent sections for name, email, password, and profile picture
- 🔒 **Email Privacy** - Toggle email visibility on profile (requires verification)
- 🖼️ **Custom Profile Pictures** - Upload your own avatar (requires S3 configuration)

### Optional Features
- 📧 **SMTP Email** - Email verification, password reset, and email change notifications
  - Gracefully disabled when SMTP is not configured
  - Users can use the platform immediately without verification
- 🖼️ **S3 Image Uploads** - Attach images to posts and custom profile pictures
  - Enabled automatically when S3 environment variables are set
  - Supports AWS S3, MinIO, DigitalOcean Spaces, Cloudflare R2, and any S3-compatible storage
  - 5MB file size limit for profile pictures, 10MB for post images
  - Gracefully disabled when S3 is not configured
- 🌐 **CORS Support** - Enable API access for separate frontend applications (Angular, React, Vue)

### Admin Features
- 🛡️ **Admin Dashboard** - Comprehensive user management
- 👥 **User Administration** - Edit names, emails, passwords independently
- 🔧 **Role Management** - Grant/revoke admin privileges
- 🎯 **First-Time Setup Wizard** - Guided setup for initial admin account and optional features
- 🔔 **Update Notifications** - Admins are told when a new release is available ([details](#-update-check))

### Technical Features
- ⚡ **Redis Caching** - Improved performance with intelligent cache invalidation
- ⚙️ **YAML Configuration** - Centralized config with environment variable overrides
- 🗄️ **Database Migrations** - Safe schema management with TypeORM migrations
- 🎨 **Server-Side Rendering** - Fast initial page loads with Handlebars
- 🔒 **Security Best Practices** - Password hashing, HTTP-only cookies, CSRF protection via Origin checking
- 📱 **Responsive Design** - Mobile-first Bootstrap 5 interface
- ☁️ **Optional Cloud Storage** - S3-compatible storage for images (AWS, MinIO, DigitalOcean, etc.)

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 22+ (Docker image: Node 26)
- **Framework:** Express 5
- **Language:** TypeScript
- **ORM:** TypeORM (with migrations)
- **Database:** MySQL 8
- **Cache:** Redis (ioredis)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **File Upload:** Multer
- **Cloud Storage (Optional):** AWS SDK v3 (S3-compatible)
- **Email (Optional):** Nodemailer (SMTP)

### Frontend
- **Template Engine:** Handlebars (express-handlebars)
- **CSS Framework:** Bootstrap 5
- **Icons:** Font Awesome, Bootstrap Icons
- **JavaScript:** Vanilla JS with modern ES6+ features

### DevOps
- **Containerization:** Docker
- **Configuration:** YAML + Environment Variables
- **Logging:** Winston (configurable levels)
- **Testing:** Jest, ts-jest
- **Build Tool:** TypeScript Compiler

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22 or later, and npm
- MySQL 8.0+
- Redis 6.0+
- (Optional) Docker and Docker Compose
- (Optional) AWS account for S3 or any S3-compatible provider
- (Optional) SMTP server for email features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/omairsalman03/UsersConnect.git
   cd usersconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```sql
   CREATE DATABASE usersconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory (see `.env.example`):
   ```env
   NODE_ENV=development
   
   # JWT Secrets (use strong random strings)
   # Generate with: openssl rand -base64 32
   ACCESS_TOKEN_SECRET=your-access-token-secret-here
   REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
   
   # Database Configuration
   DATABASE_HOST=localhost
   DATABASE_USERNAME=root
   DATABASE_PASSWORD=yourpassword
   DATABASE_NAME=usersconnect
   
   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PASSWORD=
   
   # Optional: S3 Configuration (see below for setup)
   # S3_ACCESS_KEY=
   # S3_SECRET_KEY=
   # S3_BUCKET_NAME=
   # S3_REGION=
   
   # Optional: SMTP Configuration
   # SMTP_HOST=smtp.zoho.com
   # SMTP_PORT=465
   # SMTP_SECURE=true
   # SMTP_USER=noreply@example.com
   # SMTP_PASSWORD=your_password
   
   # Optional: CORS Configuration (for separate frontends)
   # CORS_ENABLED=true
   # CORS_ALLOWED_ORIGINS=http://localhost:4200,https://app.example.com
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   > **⚠️ HTTPS note:** Auth cookies use `Secure` + `SameSite=None`, so the browser only accepts them in a secure context. `http://localhost` qualifies in Chrome and Firefox (dev works out of the box), but testing from a phone over a LAN IP — or using Safari — requires real HTTPS. See [Why HTTPS is required](#why-https-is-required).

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

The application will be available at `http://localhost:3000` and automatically redirect to the setup wizard.

---

## Why HTTPS is required

UsersConnect sets its authentication cookies (the access and refresh tokens, plus the password-reset and email-change session cookies) with the **`Secure`** and **`SameSite=None`** attributes. `SameSite=None` is what lets those cookies travel from mobile apps and other cross-site/cross-origin clients — but browsers only accept a `Secure` cookie over a **secure context**. Over a plain, non-secure connection the browser silently drops them, so sign-in, registration, and password reset appear to "do nothing."

**In production this is a non-issue.** The app runs HTTP behind a TLS-terminating reverse proxy, so end users are always on `https://`. The app itself only ever sees HTTP — which is exactly why the insecure-context check is done in the browser via `window.isSecureContext`, never on the server (a server-side check would wrongly flag every production request as insecure).

**For local development**, whether the origin is a secure context depends on the host:

| Origin | Secure context? |
| --- | --- |
| `https://…` (any host) | ✅ Yes |
| `http://localhost`, `http://127.0.0.1` | ✅ Yes (Chrome & Firefox) |
| `http://<LAN-IP>` (e.g. `http://192.168.1.20` from a phone) | ❌ No |
| Safari over plain `http://` (incl. `localhost`) | ❌ No |

So `npm run dev` on `http://localhost` works out of the box in Chrome and Firefox. You only need real TLS when testing from another device (a phone or tablet over your LAN) or in Safari. For that, serve the app over HTTPS using a TLS-terminating proxy — for example, generate a locally-trusted certificate with [mkcert](https://github.com/FiloSottile/mkcert) and front the app with a local HTTPS reverse proxy, or expose it through a tunnel (such as ngrok or Cloudflare Tunnel) that provides an `https://` URL.

The login, register, and password-reset pages detect a non-secure context client-side and — instead of failing silently — disable the form and show a banner linking back to this section.

---

## ⚙️ Configuration

UsersConnect uses a flexible configuration system with three layers:

**Priority Order:** Defaults → `config.yaml` → Environment Variables

### Configuration Methods

**Option 1: Environment Variables** (current method)
- Set all variables in `.env` or via Docker environment
- Takes highest priority

**Option 2: YAML Configuration File** (new in v1.0.2)
- Create `config.yaml` in the root directory
- See `config.example.yaml` for all available options
- Easier for managing multiple settings

**Option 3: Hybrid Approach** (recommended)
- Set secrets (passwords, tokens) via environment variables
- Set other configs via `config.yaml`
- Best of both worlds

### Required Configuration

These **must** be set before the app will start:

```bash
# Database
DATABASE_HOST=mysql
DATABASE_USERNAME=root
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=usersconnect

# Redis
REDIS_HOST=redis

# JWT Secrets
ACCESS_TOKEN_SECRET=your_secret_here
REFRESH_TOKEN_SECRET=your_secret_here
```

### Optional Features Configuration

**S3 Storage** (enables image uploads):
```yaml
# config.yaml
s3:
  accessKey: YOUR_KEY
  secretKey: YOUR_SECRET
  bucketName: usersconnect-media
  region: us-east-1
```

**SMTP Email** (enables verification & password reset):
```yaml
# config.yaml
smtp:
  host: smtp.zoho.com
  port: 465
  secure: true
  user: noreply@example.com
  password: your_smtp_password
```

**CORS** (for separate frontend apps):
```yaml
# config.yaml
cors:
  enabled: true
  allowedOrigins:
    - http://localhost:4200
    - https://app.example.com
```

---

## 🖼️ S3 Image Uploads (Optional)

UsersConnect supports **optional** image uploads in posts and custom profile pictures using any S3-compatible storage provider. This feature is **automatically enabled** when you configure the S3 environment variables or `config.yaml`, and **gracefully disabled** when they're not set.

### How It Works

- **With S3 configured:** Users see image upload fields for posts and profile pictures
- **Without S3 configured:** Upload fields are hidden, all other features work normally, Gravatar used for avatars

### Supported Providers

- ✅ **AWS S3** - Industry standard
- ✅ **MinIO** - Self-hosted, free and open source
- ✅ **DigitalOcean Spaces** - Simple pricing
- ✅ **Cloudflare R2** - No egress fees
- ✅ **Backblaze B2** - Cost-effective
- ✅ **Any S3-compatible service**

### Enabling S3 Storage

**Method 1: Environment Variables**
```bash
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET_NAME=usersconnect-media
S3_REGION=us-east-1

# For non-AWS providers:
S3_ENDPOINT=http://localhost:9000  # MinIO example
```

**Method 2: config.yaml**
```yaml
s3:
  accessKey: your-access-key
  secretKey: your-secret-key
  bucketName: usersconnect-media
  region: us-east-1
  # endpoint: http://localhost:9000  # For non-AWS
```

**Method 3: Setup Wizard**
- During first-time setup, you can configure S3 through the guided wizard
- Settings are saved to `config.yaml` automatically

**That's it!** The application automatically detects S3 configuration and enables image upload features.

### Without S3

The application works perfectly without S3 configuration - posts won't have image upload capability and profile pictures will use Gravatar. All other features remain fully functional.

---

## 🔔 Update Check

Starting with v1.2.0, UsersConnect checks once a day whether a newer version is available. When one is, admins see a badge on the **Admin Tools** link and the details on the admin page.

### What is sent

Once a day, with the first check 30 seconds after startup, the server makes one request to `https://checkin.usersconnect.cloudomair.org/v1/check` containing two values:

- `product`, which is always `api`
- `version`, the running version, e.g. `1.2.0`

Nothing else: no instance ID, no domain name, no user data, no configuration.

### What the service does with it

The check-in service replies with the latest release and, occasionally, a short notice (for example, announcing a major new release). It also counts how many distinct instances check in each day, which is the only way to know how many deployments are actually running:

- **Your IP address is never stored.** It's combined with a random secret that changes every day, and only the resulting hash is kept.
- **Each day's secret is deleted** once the day is over. After that, that day's hashes can't be linked to any address, not even by the service's operator.
- IPv6 addresses are reduced to their `/64` network before hashing.

The service is open source, so you can check exactly what it does: [omairsalman03/usersconnect-checkin](https://github.com/omairsalman03/usersconnect-checkin).

If the service is unreachable, the check logs a single warning and the app carries on unaffected.

### Notices

A notice is plain text: a title of up to 100 characters, a body of up to 500, and an optional `https` link. Notices appear only to admins, on the admin page, and can be dismissed.

### Turning it off

```yaml
# config.yaml
updateCheck:
  enabled: false
```

or set `UPDATE_CHECK_ENABLED=false`. When disabled, the app makes no requests to the service at all. The startup log always states whether the check is enabled, and where it sends.

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose

Choose the deployment option that fits your needs:

**Option 1: Basic Deployment (SSR Only)**

```yaml
version: '3.8'

services:
  app:
    image: omairsalman/usersconnect:latest
    ports:
      - "3000:3000"
    volumes:
      - ./config.yaml:/app/config.yaml  # Optional config file
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - DATABASE_HOST=mysql
      - DATABASE_USERNAME=root
      - DATABASE_PASSWORD=yourpassword
      - DATABASE_NAME=usersconnect
      - REDIS_HOST=redis
      - ACCESS_TOKEN_SECRET=your-access-secret-here
      - REFRESH_TOKEN_SECRET=your-refresh-secret-here
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: yourpassword
      MYSQL_DATABASE: usersconnect
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:alpine
    command: redis-server --requirepass yourredispassword
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

**Option 2: With AWS S3 + SMTP**

Add to app environment:
```yaml
      # S3 Configuration
      - S3_ACCESS_KEY=your-aws-access-key
      - S3_SECRET_KEY=your-aws-secret-key
      - S3_BUCKET_NAME=usersconnect-media
      - S3_REGION=us-east-1
      
      # SMTP Configuration
      - SMTP_HOST=smtp.zoho.com
      - SMTP_PORT=465
      - SMTP_SECURE=true
      - SMTP_USER=noreply@example.com
      - SMTP_PASSWORD=your_smtp_password
```

**Option 3: Self-hosted MinIO (Complete Stack)**

```yaml
version: '3.8'

services:
  app:
    image: omairsalman/usersconnect:latest
    ports:
      - "3000:3000"
    volumes:
      - ./config.yaml:/app/config.yaml
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - DATABASE_HOST=mysql
      - DATABASE_USERNAME=root
      - DATABASE_PASSWORD=yourpassword
      - DATABASE_NAME=usersconnect
      - REDIS_HOST=redis
      - REDIS_PASSWORD=yourredispassword
      - ACCESS_TOKEN_SECRET=your-access-secret-here
      - REFRESH_TOKEN_SECRET=your-refresh-secret-here
      # MinIO Configuration
      - S3_ACCESS_KEY=minioadmin
      - S3_SECRET_KEY=minioadmin
      - S3_BUCKET_NAME=usersconnect-media
      - S3_REGION=us-east-1
      - S3_ENDPOINT=http://minio:9000
      # SMTP Configuration
      - SMTP_HOST=smtp.zoho.com
      - SMTP_PORT=465
      - SMTP_SECURE=true
      - SMTP_USER=noreply@example.com
      - SMTP_PASSWORD=your_smtp_password
    depends_on:
      - mysql
      - redis
      - minio

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: yourpassword
      MYSQL_DATABASE: usersconnect
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:alpine
    command: redis-server --requirepass yourredispassword
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  minio-setup:
    image: minio/mc:latest
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      sleep 5;
      mc alias set myminio http://minio:9000 minioadmin minioadmin;
      mc mb myminio/usersconnect-media --ignore-existing;
      mc anonymous set download myminio/usersconnect-media;
      exit 0;
      "

volumes:
  mysql_data:
  redis_data:
  minio_data:
```

### Port Mapping

The internal application port is **always 3000** (matches `EXPOSE` in Dockerfile). Map to different external ports via Docker:

```bash
# Run on port 8080 externally
docker run -p 8080:3000 omairsalman/usersconnect:latest
```

### Docker Commands

```bash
# Pull latest image
docker pull omairsalman/usersconnect:latest

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

## 🎯 First-Time Setup

When you first deploy UsersConnect, you'll be automatically redirected to the **setup wizard** at `/setup`.

### Setup Process

1. **Prerequisites:** Ensure required configuration is set (database, Redis, JWT secrets)
2. **Start the application:** Visit `http://localhost:3000`
3. **Automatic redirect:** You'll be redirected to `/setup`
4. **Setup wizard guides you through:**
   - **Step 1:** Create your admin account
   - **Step 2:** (Optional) Configure S3 storage for image uploads
   - **Step 3:** (Optional) Configure SMTP for email features
   - **Step 4:** (Optional) Configure CORS for separate frontend apps
5. **Complete setup:** Click "Complete Setup"
6. **Configuration saved:** Optional settings are written to `config.yaml`
7. **Ready to use:** Redirected to login page

### After Setup

- The setup wizard is **permanently disabled** after the first admin is created
- To add more admins, use the admin panel
- To reconfigure optional features, edit `config.yaml` or environment variables

---

## 📁 Project Structure

```
usersconnect/
├── src/
│   ├── config/                      # Configuration files
│   │   ├── types/
│   │   │   └── config.types.ts      # Config interfaces
│   │   ├── config.loader.ts         # YAML + env loader
│   │   ├── dataSource.ts            # TypeORM data source
│   │   ├── default.config.ts        # Default config values
│   │   ├── environment.d.ts         # Env var type definitions
│   │   ├── express.d.ts             # Express type extensions
│   │   ├── index.ts                 # Config singleton
│   │   ├── logger.ts                # Winston logger setup
│   │   ├── redis.ts                 # Redis client
│   │   └── version.ts               # Running version from package.json
│   ├── controllers/                 # Request handlers
│   │   ├── api/
│   │   │   ├── authController.ts
│   │   │   ├── commentController.ts
│   │   │   ├── configController.ts
│   │   │   ├── emailTestController.ts
│   │   │   ├── postController.ts
│   │   │   └── userController.ts
│   │   └── web/
│   │       ├── setupController.ts   # Setup wizard
│   │       └── webController.ts     # Page rendering
│   ├── entities/                    # TypeORM entities
│   │   ├── commentEntity.ts
│   │   ├── postEntity.ts
│   │   └── userEntity.ts
│   ├── middlewares/
│   │   ├── auth/
│   │   │   ├── isAdmin.ts
│   │   │   ├── isAuthenticated.ts
│   │   │   ├── isCommentAuthor.ts
│   │   │   ├── isEmailVerified.ts
│   │   │   └── isPostAuthor.ts
│   │   ├── validation/
│   │   │   ├── commentValidation.ts
│   │   │   ├── postValidation.ts
│   │   │   └── userValidation.ts
│   │   ├── originCheck.ts           # CSRF Origin check
│   │   └── setupCheck.ts            # Setup wizard redirect
│   ├── migrations/                  # Database migrations
│   │   └── [timestamp]-InitialSchema.ts
│   ├── routers/
│   │   ├── api/
│   │   │   ├── authRouter.ts
│   │   │   ├── commentRouter.ts
│   │   │   ├── configRouter.ts
│   │   │   ├── emailTestRouter.ts
│   │   │   ├── postRouter.ts
│   │   │   └── userRouter.ts
│   │   └── web/
│   │       ├── setupRouter.ts       # Setup routes
│   │       └── webRouter.ts         # Page routes
│   ├── services/                    # Business logic
│   │   ├── authService.ts
│   │   ├── commentService.ts
│   │   ├── emailService.ts          # SMTP email (optional)
│   │   ├── postService.ts
│   │   ├── s3Service.ts             # S3 uploads (optional)
│   │   ├── updateCheckService.ts    # Daily update check (optional)
│   │   └── userService.ts
│   ├── utils/                       # Helper utilities
│   │   ├── asString.ts              # Type conversion helpers
│   │   ├── publicDTOs.ts            # Data transfer objects
│   │   ├── publicTypes.ts           # Shared type definitions
│   │   ├── s3Config.ts              # S3 feature detection
│   │   └── smtpConfig.ts            # SMTP feature detection
│   ├── public/                      # Static assets
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── images/
│   │   │   ├── home-hero.svg
│   │   │   ├── logo-icon-white.svg
│   │   │   ├── logo-icon.svg
│   │   │   └── logo.svg
│   │   └── js/                      # Client-side scripts
│   │       ├── admin-edit-user.js
│   │       ├── admin-users.js
│   │       ├── create-post.js
│   │       ├── edit-profile.js
│   │       ├── feed.js
│   │       ├── forgot-password.js
│   │       ├── login.js
│   │       ├── register.js
│   │       ├── reset-password-confirm.js
│   │       ├── secure-context-guard.js # HTTPS check on auth pages
│   │       ├── setup.js
│   │       ├── update-notice.js     # Dismiss update notices
│   │       ├── verify-email.js
│   │       └── verify-reset-code.js
│   ├── views/                       # Handlebars templates
│   │   ├── emails/                  # Email templates
│   │   │   ├── emailChangeVerifyCurrent.hbs
│   │   │   ├── emailChangeVerifyNew.hbs
│   │   │   ├── emailVerification.hbs
│   │   │   ├── layout.hbs
│   │   │   └── passwordReset.hbs
│   │   ├── helpers/
│   │   │   └── hbsHelpers.ts        # Handlebars helpers
│   │   ├── layouts/
│   │   │   └── main.hbs             # Main layout
│   │   ├── pages/
│   │   │   ├── about.hbs
│   │   │   ├── adminEditUser.hbs
│   │   │   ├── contact.hbs
│   │   │   ├── editProfile.hbs
│   │   │   ├── feed.hbs
│   │   │   ├── forgotPassword.hbs
│   │   │   ├── home.hbs
│   │   │   ├── login.hbs
│   │   │   ├── privacy.hbs
│   │   │   ├── profile.hbs
│   │   │   ├── register.hbs
│   │   │   ├── resetPassword.hbs
│   │   │   ├── resetPasswordConfirm.hbs
│   │   │   ├── setup.hbs
│   │   │   ├── terms.hbs
│   │   │   └── users.hbs
│   │   └── partials/
│   │       ├── commentCard.hbs
│   │       ├── dislikePopup.hbs
│   │       ├── footer.hbs
│   │       ├── likePopup.hbs
│   │       ├── navbar.hbs
│   │       └── postCard.hbs
│   └── index.ts                     # App entry point: middleware, routers, startup
├── dist/                            # Compiled JavaScript
├── logs/                            # Application logs
├── .dockerignore
├── .env.example                     # Environment template
├── .gitignore
├── CHANGELOG.md                     # Release history
├── CLA.md                           # Contributor License Agreement
├── CLAUDE.md                        # Architecture documentation
├── CONTRIBUTING.md                  # Contributing guidelines
├── config.example.yaml              # Configuration template
├── docker-compose-s3.yml            # Docker with MinIO
├── docker-compose.yml               # Docker Compose setup
├── Dockerfile
├── jest.config.ts                   # Jest configuration
├── LICENSE                          # AGPL-3.0 license
├── LICENSE-MIT-HISTORICAL           # MIT license (1.1.0 and earlier)
├── LICENSING.md                     # Which license applies to which version
├── nodemon.json                     # Nodemon config
├── package.json
├── PROVENANCE.md                    # Project history
├── README.md                        # This file
└── tsconfig.json                    # TypeScript config
```

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user
- `POST /auth/verify-password` - Verify password

### Users
- `GET /users` - Get all users (admin)
- `GET /users/search?search=term` - Search users
- `GET /users/:id` - Get user by ID (admin)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/:userId/posts` - Get user's posts
- `PUT /users/:userId/toggle-admin` - Toggle admin status (admin)

### Posts
- `GET /posts` - Get all posts (paginated)
- `GET /posts/:postId` - Get single post
- `POST /posts` - Create post (with optional image if S3 configured)
- `PUT /posts/:postId` - Update post
- `DELETE /posts/:postId` - Delete post
- `POST /posts/:postId/like` - Like post
- `DELETE /posts/:postId/like` - Unlike post
- `POST /posts/:postId/dislike` - Dislike post
- `DELETE /posts/:postId/dislike` - Undislike post

### Comments
- `POST /comments/:postId` - Add comment
- `PUT /comments/:commentId` - Update comment
- `DELETE /comments/:commentId` - Delete comment
- `POST /comments/:commentId/like` - Like comment
- `DELETE /comments/:commentId/like` - Unlike comment
- `POST /comments/:commentId/dislike` - Dislike comment
- `DELETE /comments/:commentId/dislike` - Undislike comment

### Config
- `GET /config/s3` - Whether S3 uploads are enabled
- `GET /config/smtp` - Whether SMTP email is enabled
- `GET /config/version` - Running version and latest update-check result (admin)
- `PUT /config/notice/dismissed` - Dismiss the current notice; body `{ "id": "..." }` (admin)

### Email Verification (requires SMTP)
- `GET /verify-email` - Show verification page
- `POST /verify-email` - Submit verification code
- `POST /verify-email/resend` - Resend verification code

### Web Pages
- `GET /` - Home page
- `GET /setup` - First-time setup wizard (if no admin exists)
- `GET /feed` - User feed (authenticated)
- `GET /profile` - Current user profile
- `GET /profile/:userId` - View user profile
- `GET /edit-profile` - Edit profile page
- `GET /admin/users` - Admin dashboard (admin)
- `GET /admin/users/:id/edit` - Edit user (admin)

---

## 🧪 Testing

> There are currently no automated tests. Jest is configured, so these commands run and new tests can be added under `src/`.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## ☁️ AWS S3 Setup Tutorial

Complete guide to setting up AWS S3 for image uploads.

### Prerequisites
- AWS Account ([sign up here](https://aws.amazon.com/))

### Step 1: Create S3 Bucket

1. **Sign in to AWS Console:** https://console.aws.amazon.com/
2. **Navigate to S3:** Search for "S3" in the services search
3. **Create Bucket:**
   - Click "Create bucket"
   - **Bucket name:** `usersconnect-media` (must be globally unique)
   - **AWS Region:** `us-east-1` (or closest to your users)
   - **Block Public Access:** Uncheck "Block all public access"
   - Acknowledge the warning
   - Click "Create bucket"

### Step 2: Configure Bucket Policy

1. **Open bucket** → **Permissions** tab
2. **Bucket policy** → Click "Edit"
3. **Paste this policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::usersconnect-media/*"
    }
  ]
}
```

4. Replace `usersconnect-media` with your bucket name
5. Click "Save changes"

**What this does:** Allows public read access so browsers can display images.

### Step 3: Create IAM User

1. **Navigate to IAM:** Search for "IAM" in services
2. **Users** → **Create user**
3. **User name:** `usersconnect-app`
4. Click "Next"
5. **Permissions:** "Attach policies directly"
6. Click "Create policy" (opens new tab)
7. **In new tab:**
   - Select "JSON" tab
   - Paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::usersconnect-media/*"
    }
  ]
}
```

   - Click "Next"
   - **Policy name:** `UsersConnectS3Access`
   - Click "Create policy"

8. **Return to user creation** → Refresh → Select `UsersConnectS3Access`
9. Click "Next" → "Create user"

### Step 4: Create Access Keys

1. Click on `usersconnect-app` user
2. **Security credentials** tab
3. **Access keys** → **Create access key**
4. Select "Application running outside AWS"
5. Click "Next" → "Create access key"
6. **⚠️ SAVE THESE - You can't see them again!**
   - **Access key ID** (e.g., `AKIAIOSFODNN7EXAMPLE`)
   - **Secret access key** (e.g., `wJalrXUtnFEMI/K7MDENG/...`)

### Step 5: Configure UsersConnect

**Option 1: Environment variables (.env):**
```bash
S3_ACCESS_KEY=AKIA...
S3_SECRET_KEY=wJal...
S3_BUCKET_NAME=usersconnect-media
S3_REGION=us-east-1
```

**Option 2: config.yaml:**
```yaml
s3:
  accessKey: AKIA...
  secretKey: wJal...
  bucketName: usersconnect-media
  region: us-east-1
```

**Option 3: Setup wizard:**
- Fill in S3 fields during first-time setup
- Settings saved automatically to `config.yaml`

### Step 6: Test

1. Restart application
2. Create a post with an image
3. Image should upload successfully
4. Check S3 bucket → Should see file in `posts/` folder

### Cost Estimate

**Free tier (first 12 months):**
- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests

**After free tier:**
- Storage: $0.023 per GB/month
- PUT: $0.005 per 1,000 requests
- GET: $0.0004 per 1,000 requests

**Example:** 1000 users, 10 posts each, 500KB images
- ~5 GB = **$0.12/month**
- ~10k PUT + 100k GET = **$0.09/month**
- **Total: ~$0.21/month**

### Alternative: MinIO (Free, Self-Hosted)

For development or self-hosting, see the Docker Compose MinIO example above. MinIO is 100% free and S3-compatible.

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Sign the [Contributor License Agreement](CLA.md) when the bot asks
6. Open Pull Request

### Commit Convention

Use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

---

## 📄 License

UsersConnect is licensed under the [GNU Affero General Public License v3.0](LICENSE), starting with version 1.2.0. Versions 1.1.0 and earlier remain available under the MIT License. See [LICENSING.md](LICENSING.md) for which license applies to which version, and [PROVENANCE.md](PROVENANCE.md) for the project's history.

---

## 🙏 Acknowledgments

- Initially developed during summer field training at **[AsalTech](https://asaltech.com/)**
- Special thanks to my backend development mentor for guidance during training
- Bootstrap team for the CSS framework
- TypeORM team for the robust ORM
- All open-source contributors

---

## 👨‍💻 Author

**Omair Salman**

- GitHub: [@omairsalman03](https://github.com/omairsalman03)
- Email: OmairSalman@outlook.com

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/omairsalman03/UsersConnect/issues)
- **Discussions:** [GitHub Discussions](https://github.com/omairsalman03/UsersConnect/discussions)
- **Email:** OmairSalman@outlook.com

---

⭐ **Star this repository if you find it helpful!**
