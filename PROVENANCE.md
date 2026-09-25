# Provenance

A record of how UsersConnect came to be, kept alongside the source.

## v0.1 – v0.2: Field training

UsersConnect was first built during summer field training at [AsalTech](https://asaltech.com/), under professional mentorship, as coursework fulfilling a university field-training requirement. These versions contain all of the application's core functionality:

- Posts, comments and likes
- Registration, login and user accounts
- User profiles and like lists
- Password change
- Admin user management

## v1.0.0-rc.1 onward: Independent development

Everything from `v1.0.0-rc.1` onward was developed independently after the training, building on that foundation:

- Dislikes
- Optional S3 image uploads and custom profile pictures
- Optional SMTP email: verification, password reset and email change
- The profile editing revamp
- Email visibility controls
- Gating interactions on email verification
- Support for separate frontends (JSON API responses and CORS)
- Layered configuration (defaults, `config.yaml`, environment variables)
- Winston logging
- TypeORM migrations
- The first-time setup wizard
- The update check (1.2.0)
- Ongoing security maintenance

The complete history is in the git log and [CHANGELOG.md](CHANGELOG.md). The dated `v0.1` and `v0.2` images remain available on Docker Hub.