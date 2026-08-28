import { User } from "../entities/userEntity";
import { Comment } from "../entities/commentEntity";
import { Post } from "../entities/postEntity";
import { PublicUser, PublicComment, PublicPost, MinimalUser } from "./publicTypes";

export function userToPublic(user: User): PublicUser {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isEmailPublic: user.isEmailPublic,
    isEmailVerified: user.isEmailVerified,
    avatarURL: user.avatarURL,
    isAdmin: user.isAdmin,
    joinedAt: user.createdAt
  };
}

export function userToMinimal(user: User): MinimalUser {
  return {
    _id: user._id,
    name: user.name,
    avatarURL: user.avatarURL
  };
}

export function commentToPublic(comment: Comment): PublicComment {
  return {
    _id: comment._id,
    content: comment.content,
    author: userToMinimal(comment.author),
    likes: comment.likes.map(userToMinimal),
    dislikes: comment.dislikes.map(userToMinimal),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

export function postToPublic(post: Post): PublicPost {
  return {
    _id: post._id,
    title: post.title,
    content: post.content,
    imageURL: post.imageURL,
    author: userToMinimal(post.author),
    likes: post.likes.map(userToMinimal),
    dislikes: post.dislikes.map(userToMinimal),
    comments: (post.comments ?? [])
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(commentToPublic),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}