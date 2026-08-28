import { User } from "../entities/userEntity";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PublicUser } from "../utils/publicTypes";
import { userToPublic } from "../utils/publicDTOs";
import logger from '../config/logger';
import redisClient from '../config/redis';
import { EmailService } from './emailService';
import { config } from '../config';

const emailService = new EmailService();

export default class AuthService
{
    async loginUser(credentials: {email: string, password: string}): Promise<PublicUser | string>
    {
        try
        {
            const user = await User.findOneBy({email: credentials.email});
            if (!user) return 'DNE';
            const match = await bcrypt.compare(credentials.password, user.password);
            if(match)
            {
                const safeUser = userToPublic(user);
                return safeUser;
            }
            else
                return 'ICR';
        }
        catch(error)
        {
            
            
            
            logger.error(`Error logging in: `, error);
        }
        return 'error';
    }

    async registerUser(newUser: { name: string, email: string, password: string, confirmPassword: string}): Promise<{ success: boolean; message?: string; user?: PublicUser }>
    {
        try
        {
            // Check if email already exists
            const existingUser = await User.findOneBy({ email: newUser.email });
            
            if (existingUser) {
                return {
                    success: false,
                    message: 'An account with this email already exists'
                };
            }

            const user = new User();
            user.name = newUser.name;
            user.email = newUser.email;
            user.isAdmin = false;

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newUser.password, salt);
            const hash = crypto.createHash('sha256').update(user.email.trim()).digest('hex');
            user.avatarURL = `https://gravatar.com/avatar/${hash}?s=256&d=initials`;
            
            await user.save();
            
            const safeUser = userToPublic(user);
            
            return {
                success: true,
                user: safeUser
            };
        }
        catch (error)
        {
            logger.error('Error registering user:', error);
            return {
                success: false,
                message: 'Failed to register user'
            };
        }
    }

    async verifyPassword(userId: string, password: string): Promise<PublicUser | null>
    {
        const user = await User.findOneBy({ _id: userId });
        if(!user) return null;

        const match = await bcrypt.compare(password, user.password);
        if(match)
            return userToPublic(user);
        return null;
    }
    
    /**
     * Request password reset - generates code and sends email
     * @param email - User's email address
     * @returns Success message or error
     */
    async requestPasswordReset(email: string): Promise<string>
    {
        try
        {
            // Check if user exists
            const user = await User.findOneBy({ email });
            
            // Security: Always return success even if user doesn't exist
            // This prevents email enumeration attacks
            if (!user)
            {
                logger.warn(`Password reset requested for non-existent email: ${email}`);
                return 'success'; // Pretend it worked
            }

            // Generate 6-digit code
            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Store in Redis with configured password-reset TTL
            await redisClient.setex(
                `password-reset:${email}`,
                config.redis.ttl.passwordReset,
                resetCode
            );

            // Send email
            await emailService.sendPasswordResetEmail(email, user.name, resetCode);

            logger.info(`Password reset code generated for ${email}`);
            return 'success';
        }
        catch (error)
        {
            logger.error('Error in requestPasswordReset:', error);
            return 'error';
        }
    }

    /**
     * Verify reset code and create temporary session
     * @param email - User's email
     * @param code - 6-digit code from email
     * @returns Session token or null if invalid
     */
    async verifyResetCode(email: string, code: string): Promise<string | {  success: boolean; message: string }>
    {
        try
        {
            // Get code from Redis
            const storedCode = await redisClient.get(`password-reset:${email}`);

            if(!storedCode)
            {
                logger.warn(`Reset code expired for ${email}`);
                return {
                    success: false,
                    message: 'Reset code expired. Please request a new one.'
                }
            }

            if (storedCode !== code)
            {
                logger.warn(`Invalid reset code attempt for ${email}`);
                return {
                    success: false,
                    message: 'Invalid reset code. Please check the code and try again.'
                }
            }

            // Code is valid - generate session token
            const sessionToken = crypto.randomBytes(32).toString('hex');

            // Store session in Redis with configured session TTL
            await redisClient.setex(
                `reset-session:${sessionToken}`,
                config.redis.ttl.session,
                email
            );

            // Delete the reset code (one-time use)
            await redisClient.del(`password-reset:${email}`);

            logger.info(`Reset code verified for ${email}, session created`);
            return sessionToken;
        }
        catch (error)
        {
            logger.error('Error in verifyResetCode:', error);
            return{
                success: false,
                message: `Error in verifyResetCode: ${error}`
            }
        }
    }

    /**
     * Reset password using session token
     * @param sessionToken - Temporary session token from cookie
     * @param newPassword - New password
     * @returns Success or error message
     */
    async resetPasswordWithSession(sessionToken: string, newPassword: string): Promise<string>
    {
        try
        {
            // Get email from session
            const email = await redisClient.get(`reset-session:${sessionToken}`);

            if (!email)
            {
                logger.warn('Invalid or expired reset session');
                return 'invalid-session';
            }

            // Get user
            const user = await User.findOneBy({ email });
            if (!user)
            {
                return 'user-not-found';
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update password
            await User.update({ _id: user._id }, { password: hashedPassword });

            // Delete session (one-time use)
            await redisClient.del(`reset-session:${sessionToken}`);

            logger.info(`Password reset successful for ${email}`);
            return 'success';
        }
        catch (error)
        {
            logger.error('Error in resetPasswordWithSession:', error);
            return 'error';
        }
    }

    async requestEmailVerification(userId: string): Promise<{ success: boolean; message: string }>
    {
        try
        {
            const user = await User.findOneBy({ _id: userId });
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            if (user.isEmailVerified) {
                return { success: false, message: 'Email already verified' };
            }

            // Generate 6-digit code
            const code = crypto.randomInt(100000, 999999).toString();
            
            // Store in Redis with configured email-verification TTL
            await redisClient.setex(`email-verification:${user.email}`, config.redis.ttl.emailVerification, code);
            
            // Send email
            const emailSent = await emailService.sendVerificationEmail(user.email, user.name, code);
            
            if (!emailSent) {
                return { success: false, message: 'Failed to send verification email' };
            }
            
            logger.info(`Email verification code sent to ${user.email}`);
            return { success: true, message: 'Verification code sent to your email' };
        }
        catch (error)
        {
            logger.error('Error requesting email verification:', error);
            return { success: false, message: 'Failed to send verification code' };
        }
    }

    async verifyEmailCode(userId: string, code: string): Promise<{ success: boolean; message: string }>
    {
        try
        {
            const user = await User.findOneBy({ _id: userId });
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            if (user.isEmailVerified) {
                return { success: false, message: 'Email already verified' };
            }

            // Get stored code from Redis
            const storedCode = await redisClient.get(`email-verification:${user.email}`);
            
            if (!storedCode || storedCode !== code) {
                return { success: false, message: 'Invalid or expired code' };
            }

            // Mark email as verified
            user.isEmailVerified = true;
            await user.save();

            // Clear the verification code
            await redisClient.del(`email-verification:${user.email}`);
            
            logger.info(`Email verified for user ${user.email}`);
            return { success: true, message: 'Email verified successfully!' };
        }
        catch (error)
        {
            logger.error('Error verifying email code:', error);
            return { success: false, message: 'Verification failed' };
        }
    }

    async requestEmailChange(userId: string, currentEmail: string): Promise<{ success: boolean; message: string }>
    {
        try
        {
            // Get user name for email
            const user = await User.findOneBy({ _id: userId });
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // Generate 6-digit code
            const code = crypto.randomInt(100000, 999999).toString();
            
            // Store in Redis with configured email-verification TTL
            await redisClient.setex(`email-change:current:${currentEmail}`, config.redis.ttl.emailVerification, code);
            
            // Send email to CURRENT address
            const emailSent = await emailService.sendEmailChangeVerifyCurrent(currentEmail, user.name, code);
            
            if (!emailSent) {
                return { success: false, message: 'Failed to send verification email' };
            }
            
            return { success: true, message: 'Verification code sent to your current email' };
        }
        catch (error)
        {
            logger.error('Error requesting email change:', error);
            return { success: false, message: 'Failed to send verification code' };
        }
    }

    async requestNewEmailVerification(userId: string, newEmail: string, tempToken: string): Promise<{ success: boolean; message: string }>
    {
        try
        {
            // Verify temp token
            const storedToken = await redisClient.get(`email-change:session:${userId}`);
            
            if (!storedToken || storedToken !== tempToken)
            {
                return { success: false, message: 'Session expired. Please start over.' };
            }
            
            // Check if new email already exists
            const existingUser = await User.findOneBy({ email: newEmail });
            if (existingUser)
            {
                return { success: false, message: 'This email is already in use by another account' };
            }
            
            // Get user name for email
            const user = await User.findOneBy({ _id: userId });
            if (!user) {
                return { success: false, message: 'User not found' };
            }
            
            // Generate 6-digit code
            const code = crypto.randomInt(100000, 999999).toString();
            
            // Store new email and code with configured email-verification TTL
            await redisClient.setex(`email-change:new:${userId}`, config.redis.ttl.emailVerification, JSON.stringify({ newEmail, code }));
            
            // Send email to NEW address
            const emailSent = await emailService.sendEmailChangeVerifyNew(newEmail, user.name, code);
            
            if (!emailSent) {
                return { success: false, message: 'Failed to send verification email' };
            }
            
            logger.info(`New email verification code sent to ${newEmail} for user ${userId}`);
            return { success: true, message: 'Verification code sent to new email' };
        }
        catch (error)
        {
            logger.error('Error requesting new email verification:', error);
            return { success: false, message: 'Failed to send verification code' };
        }
    }

    async verifyCurrentEmail(email: string, code: string, userId: string): Promise<{ success: boolean; message: string; tempToken?: string }>
    {
        try
        {
            const storedCode = await redisClient.get(`email-change:current:${email}`);
            
            if (!storedCode || storedCode !== code)
            {
                return { success: false, message: 'Invalid or expired code' };
            }
            
            // Generate temporary session token
            const tempToken = crypto.randomBytes(32).toString('hex');
            
            // Store temp token with configured session TTL
            await redisClient.setex(`email-change:session:${userId}`, config.redis.ttl.session, tempToken);
            
            // Clear the verification code
            await redisClient.del(`email-change:current:${email}`);
            
            return { success: true, message: 'Current email verified', tempToken };
        }
        catch (error)
        {
            logger.error('Error verifying current email:', error);
            return { success: false, message: 'Verification failed' };
        }
    }

    async confirmEmailChange(userId: string, code: string, tempToken: string): Promise<{ success: boolean; message: string; newEmail?: string }>
    {
        try
        {
            // Verify temp token
            const storedToken = await redisClient.get(`email-change:session:${userId}`);
            
            if (!storedToken || storedToken !== tempToken)
            {
                return { success: false, message: 'Session expired. Please start over.' };
            }
            
            // Get stored new email and code
            const storedData = await redisClient.get(`email-change:new:${userId}`);
            
            if (!storedData)
            {
                return { success: false, message: 'Verification expired. Please start over.' };
            }
            
            const { newEmail, code: storedCode } = JSON.parse(storedData);
            
            if (code !== storedCode)
            {
                return { success: false, message: 'Invalid code' };
            }
            
            // Update user email
            const user = await User.findOneBy({ _id: userId });
            if (!user)
            {
                return { success: false, message: 'User not found' };
            }
            
            user.email = newEmail;
            
            // Update Gravatar URL if using Gravatar
            if (user.avatarURL.includes('gravatar.com'))
            {
                const hash = crypto.createHash('sha256').update(newEmail.trim().toLowerCase()).digest('hex');
                user.avatarURL = `https://gravatar.com/avatar/${hash}?s=256&d=initials`;
            }
            
            await user.save();
            
            // Clean up Redis keys
            await redisClient.del(`email-change:session:${userId}`);
            await redisClient.del(`email-change:new:${userId}`);
            
            // Invalidate cache
            const keys = await redisClient.keys(`usersconnect:user:${userId}:posts:*`);
            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }
            await redisClient.del('feed:page:1');
            
            return { success: true, message: 'Email changed successfully', newEmail };
        }
        catch (error)
        {
            logger.error('Error confirming email change:', error);
            return { success: false, message: 'Failed to change email' };
        }
    }
}