require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const { PrismaClient } = require("@prisma/client");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("./utils/auth");
const authMiddleware = require("./middleware/authMiddleware");
const upload = require("./utils/multerConfig");
const path = require("path");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  "/uploads",
  express.static(path.join(__dirname, process.env.UPLOAD_DIR || "./Uploads"))
);

// Auth Routes

// Register
app.post("/api/auth/register", upload.single("avatar"), async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, bio } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        bio: bio || null,
        avatar: req.file ? `/uploads/${req.file.filename}` : null,
      },
    });

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(201).json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Current User
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        bio: true,
        avatar: true,
        followers: { select: { id: true } },
        following: { select: { id: true } },
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// Update user profile (auth required)
app.put(
  "/api/users/me",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { firstName, lastName, username, bio } = req.body;
      if (!firstName || !lastName || !username) {
        return res.status(400).json({
          message: "First name, last name, and username are required",
        });
      }

      const existingUser = await prisma.user.findFirst({
        where: { username, id: { not: req.user.id } },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const updateData = { firstName, lastName, username, bio: bio || null };
      if (req.file) {
        updateData.avatar = `/uploads/${req.file.filename}`;
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          bio: true,
          avatar: true,
          followers: { select: { id: true } },
          following: { select: { id: true } },
        },
      });
      res.json({ user });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Upload user avatar (auth required)
app.post(
  "/api/users/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No file uploaded or invalid file type" });
      }

      const avatarPath = `/uploads/${req.file.filename}`;
      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: avatarPath },
      });
      res.json({ avatar: user.avatar });
    } catch (error) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// User Profile (public)
app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        avatar: true,
        followers: { select: { id: true } },
        following: { select: { id: true } },
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Follow User (auth required)
app.post("/api/users/:id/follow", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (userId === req.user.id) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }
    const alreadyFollowing = await prisma.user.findFirst({
      where: { id: req.user.id, following: { some: { id: userId } } },
    });
    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following this user" });
    }
    await prisma.user.update({
      where: { id: req.user.id },
      data: { following: { connect: { id: userId } } },
    });
    res.json({ message: "Followed user successfully" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unfollow User (auth required)
app.delete("/api/users/:id/follow", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (userId === req.user.id) {
      return res.status(400).json({ message: "Cannot unfollow yourself" });
    }
    const userToUnfollow = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }
    const isFollowing = await prisma.user.findFirst({
      where: { id: req.user.id, following: { some: { id: userId } } },
    });
    if (!isFollowing) {
      return res.status(400).json({ message: "Not following this user" });
    }
    await prisma.user.update({
      where: { id: req.user.id },
      data: { following: { disconnect: { id: userId } } },
    });
    res.json({ message: "Unfollowed user successfully" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Post Routes

// Get all posts (no auth, with optional authorId filter)
app.get("/api/posts", async (req, res) => {
  try {
    const { authorId } = req.query;
    const where = authorId ? { authorId: parseInt(authorId) } : {};
    if (authorId && isNaN(parseInt(authorId))) {
      return res.status(400).json({ message: "Invalid author ID" });
    }
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single post (no auth)
app.get("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create post with optional thumbnail (auth required)
app.post(
  "/api/posts",
  authMiddleware,
  upload.single("thumbnail"),
  async (req, res) => {
    try {
      const { title, content, summary } = req.body;
      if (!title || !content) {
        return res
          .status(400)
          .json({ message: "Title and content are required" });
      }

      const postData = {
        title,
        content,
        summary,
        authorId: req.user.id,
      };
      if (req.file) {
        postData.thumbnail = `/uploads/${req.file.filename}`;
      }
      const post = await prisma.post.create({ data: postData });
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update post with optional thumbnail (auth, owner only)
app.put(
  "/api/posts/:id",
  authMiddleware,
  upload.single("thumbnail"),
  async (req, res) => {
    const { id } = req.params;
    try {
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (post.authorId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { title, content } = req.body;
      const updateData = { title, content };
      if (req.file) {
        updateData.thumbnail = `/uploads/${req.file.filename}`;
      }
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: updateData,
      });
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete post (auth, owner only)
app.delete("/api/posts/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.post.delete({ where: { id: postId } });
    res.json({ message: "Post deleted" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Comment Routes

// Get comments for a post (no auth)
app.get("/api/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  try {
    const postIdNum = parseInt(postId);
    if (isNaN(postIdNum)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    const comments = await prisma.comment.findMany({
      where: { postId: postIdNum },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create comment (auth required)
app.post("/api/posts/:postId/comments", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  try {
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }
    const postIdNum = parseInt(postId);
    if (isNaN(postIdNum)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    const post = await prisma.post.findUnique({ where: { id: postIdNum } });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await prisma.comment.create({
      data: { content, postId: postIdNum, userId: req.user.id },
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete comment (auth, owner only)
app.delete("/api/comments/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const commentId = parseInt(id);
    if (isNaN(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
