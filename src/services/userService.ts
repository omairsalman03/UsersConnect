import { User } from "../entities/userEntity";
import crypto from 'crypto';
import { PublicUser } from "../utils/publicTypes";
import { userToPublic } from "../utils/publicDTOs";
import redisClient from "../config/redis";
import bcrypt from 'bcrypt';
import logger from '../config/logger';
import { S3Service } from "./s3Service";
import { isEmailVerified } from "../middlewares/auth/isEmailVerified";

const s3Service = new S3Service();

export default class UserService
{
    async readUsers(): Promise<PublicUser[]>
    {
        try
        {
            const users = await User.find();
            const safeUsers = users.map(userToPublic);
            return safeUsers;
        }
        catch(error)
        {
            
            
            
            logger.error(`Error fetching users data from DB:\n`, error);
            return [];
        }
    }

    async getUserById(userId: string): Promise<PublicUser | null>
    {
        const user = await User.findOneBy({ _id: userId });
        if (!user) return null;
        const safeUser = userToPublic(user);
        return safeUser;
    }

    async updateUser(userId: string, updatedUser: {name: string, email: string, isEmailPublic?: boolean, isEmailVerified?: boolean, currentPassword?: string, newPassword?: string, confirmPassword?: string, avatarURL?: string}): Promise<PublicUser | string>
    {
        const user = await User.findOneBy({ _id: userId });
        if (!user) {
            return "User not found";
        }

        // If trying to change password, verify current password first
        if (updatedUser.newPassword && updatedUser.newPassword.trim() !== "") {
            if (!updatedUser.currentPassword) {
                return "Current password is required to change password";
            }
            
            const passwordMatch = await bcrypt.compare(updatedUser.currentPassword, user.password);
            if (!passwordMatch) {
                return "Current password is incorrect";
            }
        }

        const updateData: any = {
            name: updatedUser.name,
        };

        // ============================================
        // EMAIL UPDATE LOGIC
        // ============================================
        if (updatedUser.email && updatedUser.email !== user.email) {
            // Check if email already exists
            const existing = await User.findOneBy({ email: updatedUser.email });
            if (existing && existing._id !== userId) {
                return "Email is already in use.";
            }

            updateData.email = updatedUser.email;

            // Only update avatar if currently using Gravatar
            if (user.avatarURL.includes('gravatar.com')) {
                const hash = crypto.createHash('sha256').update(updatedUser.email.trim().toLowerCase()).digest('hex');
                updateData.avatarURL = `https://gravatar.com/avatar/${hash}?s=256&d=initials`;
            }
            // If user has custom S3 avatar, keep it unchanged

            // A new email address is unverified by definition — force
            // re-verification regardless of what the client sent. This is
            // enforced server-side so every client (web, mobile, API) behaves
            // identically when an admin changes a user's email.
            updateData.isEmailVerified = false;
        }

        // ============================================
        // OTHER UPDATES
        // ============================================
        if (typeof updatedUser.isEmailPublic === 'boolean') {
            updateData.isEmailPublic = updatedUser.isEmailPublic;
        }
        
        if (updatedUser.newPassword && updatedUser.newPassword.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updatedUser.newPassword, salt);
        }

        await User.update({ _id: userId }, updateData);
        const updatedUserRecord = await User.findOneBy({ _id: userId });
        if (!updatedUserRecord) {
            return "User not found";
        }
        
        // Invalidate cache
        const keys = await redisClient.keys(`usersconnect:user:${userId}:posts:*`);
        if (keys.length > 0) {
            const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));
            await redisClient.del(...keysWithoutPrefix);
        }
        await redisClient.del('feed:page:1');

        const safeUser = userToPublic(updatedUserRecord);
        return safeUser;
    }

    async deleteUser(userId: string): Promise<PublicUser | null>
    {
        const user = await User.findOneBy({ _id: userId });
        if(!user) return null;
        await user.remove();
        await redisClient.del('feed:page:1');

        const safeUser = userToPublic(user);
        return safeUser;
    }

    async searchUsers(searchTerm: string): Promise<PublicUser[]>
    {
        const users = await this.readUsers();
        const filteredUsers = users.filter(u =>
            (u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.email.toLowerCase().includes(searchTerm.toLowerCase())));
        return filteredUsers;
    }

    async toggleAdmin(userId: string): Promise<PublicUser | null>
    {
        const user = await User.findOneBy({_id: userId});
        if(!user) return null;
        user.isAdmin = !user.isAdmin;
        await user.save();
        const safeUser = userToPublic(user);
        return safeUser;
    }

    async uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<PublicUser | null>
    {
        try
        {
            const user = await User.findOneBy({ _id: userId });
            if (!user) return null;

            // Delete old custom picture from S3 if it exists
            if (user.avatarURL && !user.avatarURL.includes('gravatar.com'))
            {
                await s3Service.deleteProfilePicture(user.avatarURL);
            }

            // Upload new picture to S3
            const newAvatarURL = await s3Service.uploadProfilePicture(file, userId);

            // Update user's avatarURL
            await User.update({ _id: userId }, { avatarURL: newAvatarURL });
            
            // Invalidate cache
            const keys = await redisClient.keys(`usersconnect:user:${userId}:posts:*`);
            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }
            await redisClient.del('feed:page:1');

            const updatedUser = await User.findOneBy({ _id: userId });
            if (!updatedUser) return null;

            const safeUser = userToPublic(updatedUser);
            return safeUser;
        }
        catch (error)
        {
            
            logger.error(`Error uploading profile picture:`, error);
            return null;
        }
    }

    async removeProfilePicture(userId: string): Promise<PublicUser | null>
    {
        try
        {
            const user = await User.findOneBy({ _id: userId });
            if (!user) return null;

            // Delete custom picture from S3 if it exists
            if (user.avatarURL && !user.avatarURL.includes('gravatar.com'))
            {
                await s3Service.deleteProfilePicture(user.avatarURL);
            }

            // Regenerate Gravatar URL
            const email = user.email.trim().toLowerCase();
            const hash = crypto.createHash('sha256').update(email).digest('hex');
            const gravatarURL = `https://gravatar.com/avatar/${hash}?s=256&d=initials`;

            // Update user's avatarURL
            await User.update({ _id: userId }, { avatarURL: gravatarURL });

            // Invalidate cache
            const keys = await redisClient.keys(`usersconnect:user:${userId}:posts:*`);
            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }
            await redisClient.del('feed:page:1');

            const updatedUser = await User.findOneBy({ _id: userId });
            if (!updatedUser) return null;

            const safeUser = userToPublic(updatedUser);
            return safeUser;
        }
        catch (error)
        {
            
            logger.error(`Error removing profile picture:`, error);
            return null;
        }
    }
}