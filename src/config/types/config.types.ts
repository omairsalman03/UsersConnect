export interface AppConfig {
  /** HTTP server settings */
  app: {
    /** Runtime environment — controls TypeORM synchronize, cookie security, view caching */
    nodeEnv: 'development' | 'production' | 'test';
  };

  /** MySQL database connection settings */
  database: {
    host: string;
    username: string;
    password: string;
    name: string;
    /** Number of times to retry the initial DB connection before exiting */
    connectionRetries: number;
    /** Milliseconds to wait between each connection retry */
    retryDelay: number;
  };

  /** Redis cache connection and TTL settings */
  redis: {
    host: string;
    /** Optional — leave empty if Redis has no password */
    password?: string;
    ttl: {
      /** Default cache TTL in seconds (e.g. feed page 1) */
      default: number;
      /** Short-lived TTL in seconds (e.g. like count caches) */
      short: number;
      /** Long-lived TTL in seconds (e.g. paginated user posts) */
      long: number;
      /** TTL for email verification codes in seconds */
      emailVerification: number;
      /** TTL for password-reset codes in seconds */
      passwordReset: number;
      /** TTL for temporary session tokens (reset-session, email-change-session) in seconds */
      session: number;
    };
  };

  /** JWT signing secrets and expiry durations */
  jwt: {
    /** Secret used to sign access tokens — must be a strong random string */
    accessTokenSecret: string;
    /** Secret used to sign refresh tokens — must be a strong random string */
    refreshTokenSecret: string;
    /**
     * Access token expiry accepted by jsonwebtoken (e.g. '15m', '1h').
     * Should stay short to limit exposure if a token is compromised.
     */
    accessTokenExpiry: string;
    /**
     * Refresh token expiry accepted by jsonwebtoken (e.g. '30d', '7d').
     * Longer-lived; stored as an httpOnly cookie.
     */
    refreshTokenExpiry: string;
  };

  /** Gravatar integration (optional) */
  gravatar: {
    /** Gravatar API key — only needed for advanced profile picture features */
    apiKey?: string;
  };

  /**
   * S3-compatible object storage for post images and profile pictures.
   * All fields are optional — omitting them disables image uploads.
   */
  s3: {
    /** Custom endpoint for non-AWS providers (e.g. MinIO: http://localhost:9000) */
    endpoint?: string;
    accessKey?: string;
    secretKey?: string;
    bucketName?: string;
    /** AWS region (default: us-east-1) */
    region?: string;
    /** Override the public URL prefix for uploaded files (e.g. a CDN URL) */
    publicUrl?: string;
  };

  /**
   * SMTP settings for transactional email (password reset, email verification).
   * All fields are optional — omitting host/user/password disables email sending.
   */
  smtp: {
    host?: string;
    port?: number;
    /** Use TLS for the SMTP connection */
    secure?: boolean;
    user?: string;
    password?: string;
    from: {
      /** Display name shown in the From field */
      name: string;
      /** Sender email address */
      email?: string;
    };
  };

  /** Multer file upload size limits */
  upload: {
    /** Maximum profile picture size in bytes */
    maxProfilePictureSizeBytes: number;
    /** Maximum post image size in bytes */
    maxPostImageSizeBytes: number;
  };

  /**
   * CORS (Cross-Origin Resource Sharing) configuration.
   * Required when serving API requests from a separate frontend domain.
   * Disabled by default — safe for SSR-only deployments.
   */
  cors: {
    /** Enable/disable CORS middleware. Set to true only when using a separate frontend. */
    enabled: boolean;
    /** Allowed origin URLs (e.g. ['http://localhost:4200', 'https://app.example.com']) */
    allowedOrigins: string[];
    /** Allow credentials (cookies) in cross-origin requests */
    allowCredentials: boolean;
    /** Allowed HTTP methods */
    allowedMethods: string[];
    /** Allowed request headers */
    allowedHeaders: string[];
  };

  /** Winston logger settings */
  logging: {
    /** Minimum log level to output */
    level: 'error' | 'warn' | 'info' | 'debug';
    /** Directory for log files (absolute path recommended for production) */
    directory: string;
    /** Maximum size of a single log file in bytes before rotation */
    maxFileSize: number;
    /** Maximum number of rotated log files to keep */
    maxFiles: number;
  };

    /**
   * Update check: once a day, asks the UsersConnect check-in service whether a
   * newer version exists, so admins see an "update available" notice.
   * Sends only the product name and this instance's version number.
   * The service counts distinct instances per day without storing IP addresses.
   */
  updateCheck: {
    /** Set to false to disable the check entirely */
    enabled: boolean;
    /** Base URL of the check-in service */
    endpoint: string;
  };
}