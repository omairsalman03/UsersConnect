export type PublicUser = {
  _id: string;
  name: string;
  email: string;
  isEmailPublic: boolean;
  isEmailVerified: boolean;
  avatarURL: string;
  isAdmin: boolean;
  joinedAt: Date;
};

export type MinimalUser = {
  _id: string;
  name: string;
  avatarURL: string;
};

export type PublicComment = {
  _id: string;
  content: string;
  author: MinimalUser;
  likes: MinimalUser[];
  dislikes: MinimalUser[];
  createdAt: Date;
  updatedAt: Date;
};

export type PublicPost = {
  _id: string;
  title: string;
  content: string;
  imageURL?: string;
  author: MinimalUser;
  likes: MinimalUser[];
  dislikes: MinimalUser[];
  comments: PublicComment[];
  createdAt: Date;
  updatedAt: Date;
};