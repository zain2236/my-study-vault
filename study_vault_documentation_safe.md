# Study Vault — Project Documentation (Security-Safe Edition)

> **Purpose**: This document provides comprehensive context about the Study Vault application for AI/LLM training. It is designed to be safe for use in public-facing chatbots — all sensitive implementation details, internal paths, security mechanisms, and infrastructure specifics have been removed.

---

## Table of Contents

1. [What is Study Vault?](#1-what-is-study-vault)
2. [Key Features](#2-key-features)
3. [Technology Overview](#3-technology-overview)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [User Workflows](#5-user-workflows)
6. [Pages & Navigation](#6-pages--navigation)
7. [Resource Management](#7-resource-management)
8. [Search & Filtering](#8-search--filtering)
9. [AI Summarization Feature](#9-ai-summarization-feature)
10. [Account & Authentication](#10-account--authentication)
11. [File Handling](#11-file-handling)
12. [Design & User Interface](#12-design--user-interface)
13. [Supported File Types & Limits](#13-supported-file-types--limits)
14. [Frequently Asked Questions (FAQ)](#14-frequently-asked-questions-faq)
15. [Glossary](#15-glossary)
16. [Troubleshooting Guide](#16-troubleshooting-guide)
17. [Feature Descriptions for Users](#17-feature-descriptions-for-users)

---

## 1. What is Study Vault?

**Study Vault** is an educational resource-sharing platform built for university students. It provides a centralized place where students can:

- **Upload** study materials such as notes, assignments, past papers, quizzes, syllabi, and date sheets
- **Organize** their resources by semester and subject
- **Share** resources publicly with other students
- **Browse** a library of publicly shared study materials
- **Download** resources uploaded by other students
- **Summarize** documents using AI to quickly understand key points

### Who is it for?

Study Vault is designed for:
- **University students** who want to organize their study materials
- **Students looking for resources** shared by peers (past papers, notes, syllabi)
- **Study groups** who want a shared resource repository

### Core Value Proposition

Study Vault solves the problem of fragmented study resources. Instead of searching through WhatsApp groups, email threads, and scattered Google Drives, students have one organized platform where everything is searchable, downloadable, and shareable.

---

## 2. Key Features

### For Registered Users (Dashboard)

| Feature | Description |
|---|---|
| **File Upload** | Upload study materials (PDF, DOCX, DOC, JPG, JPEG, PNG) up to 20MB each |
| **Resource Organization** | Organize by title, subject, semester (1–8), and resource type |
| **Publish/Unpublish** | Control whether your resources are visible to other students |
| **AI Summarization** | Get AI-generated summaries of PDF and DOCX documents |
| **Download Tracking** | See how many times your resources have been downloaded |
| **Resource Management** | Edit, delete, publish, or unpublish your uploaded resources |
| **Semester Filtering** | Filter your resources by semester using the sidebar |
| **Search** | Instantly search through your resources by title or subject |

### For All Visitors (Public)

| Feature | Description |
|---|---|
| **Browse Resources** | Browse all publicly shared study materials |
| **Search & Filter** | Search by keyword, filter by semester (1–8), and filter by resource type |
| **Download** | Download any public resource for free |
| **No Account Required** | Browse and download without creating an account |

### Resource Types Supported

Users can categorize their uploads as one of these types:
1. **Notes** — Lecture notes, class notes, handwritten notes
2. **Assignment** — Homework assignments, lab reports
3. **Quiz** — Quiz papers, quiz solutions
4. **Date Sheet** — Exam schedules, date sheets
5. **Syllabus** — Course syllabi, course outlines
6. **Past Papers** — Previous exam papers, model papers

---

## 3. Technology Overview

Study Vault is a modern full-stack web application built with industry-standard technologies:

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React | User interface library |
| **Framework** | React Router v7 | Full-stack framework with server-side rendering |
| **Language** | TypeScript | Type-safe JavaScript |
| **Styling** | TailwindCSS | Utility-first CSS framework |
| **Icons** | Lucide React | Modern SVG icon library |
| **Database** | PostgreSQL | Relational database for users and resources |
| **ORM** | Prisma | Type-safe database queries |
| **File Storage** | Cloud object storage | Uploaded files stored securely in the cloud |
| **AI** | Large Language Model | Document summarization |
| **Deployment** | Vercel | Hosting and serverless deployment |

### Architecture Style

- **Server-Side Rendered (SSR)**: Pages are rendered on the server for fast initial loads and SEO
- **Full-Stack**: Both frontend and backend logic live in a single codebase
- **Cloud-Native**: Files are stored in the cloud (not on the application server)
- **Direct-to-Cloud Uploads**: Files are uploaded directly from the browser to cloud storage, keeping the server lightweight

---

## 4. User Roles & Permissions

Study Vault has two implicit user states:

### Guest (Not Logged In)
- ✅ View the home page, about page, features page
- ✅ Browse public resources on the `/resources` page
- ✅ Search and filter public resources
- ✅ Download public resources
- ✅ View legal pages (Privacy Policy, Terms of Service, Disclaimer)
- ❌ Cannot upload resources
- ❌ Cannot access the dashboard
- ❌ Cannot publish or manage resources
- ❌ Cannot use AI summarization

### Registered User (Logged In)
- ✅ All guest permissions
- ✅ Access the personal dashboard at `/user/dashboard`
- ✅ Upload files (PDF, DOCX, DOC, JPG, JPEG, PNG — up to 20MB each)
- ✅ Publish resources to make them publicly visible
- ✅ Unpublish resources to make them private again
- ✅ Delete their own resources
- ✅ Summarize their own PDF and DOCX files with AI
- ✅ View download counts on their resources
- ✅ Filter and search their own resources

### Important: Users can only manage their OWN resources
- A user cannot edit, delete, or unpublish another user's resources
- A user can only summarize their own documents
- All users can download any public resource

---

## 5. User Workflows

### 5.1 Registration & Login

**Creating an Account:**
1. Go to `/sign-up`
2. Enter username, email, and password (minimum 8 characters)
3. Agree to Terms of Service and Privacy Policy
4. Click "Create Account"
5. You're automatically logged in and redirected to your dashboard

**Logging In:**
1. Go to `/login`
2. Enter email and password
3. Click "Sign In"
4. Redirected to dashboard

**Google Sign-In:**
1. Click "Continue with Google" on login or sign-up page
2. Authorize Study Vault in Google's consent screen
3. Automatically logged in and redirected to dashboard
4. If you signed up with Google, you don't have a password — you must use Google to log in

**Password Reset:**
1. Click "Forgot password?" on the login page
2. Enter your email address
3. Check your email for a reset link (valid for 1 hour)
4. Click the link and enter your new password (minimum 8 characters)
5. Confirm your new password
6. Redirected to login page with success message

### 5.2 Uploading a Resource

1. Go to your dashboard (`/user/dashboard`)
2. Click the "Upload" button
3. Fill in the resource details:
   - **Title** — Name of your resource (e.g., "Data Structures Mid-Term Notes")
   - **Subject** — Course name (e.g., "Data Structures & Algorithms")
   - **Semester** — Select semester 1 through 8
   - **Resource Type** — Choose from: Notes, Assignment, Quiz, Date Sheet, Syllabus, Past Papers
4. Select your file by clicking "Browse" or drag-and-drop
   - Supported formats: PDF, DOCX, DOC, JPG, JPEG, PNG
   - Maximum file size: 20MB
5. Click "Upload"
6. Wait for the upload to complete (progress bar shows percentage)
7. Your resource appears on your dashboard (private by default)

### 5.3 Publishing a Resource

1. On your dashboard, find the resource you want to share
2. Click the "Publish" button on the resource card
3. The resource is now visible to all users on the `/resources` page
4. To make it private again, click "Unpublish"

### 5.4 Downloading a Resource

**From the public resources page:**
1. Go to `/resources`
2. Browse or search for the resource you need
3. Click the "Download" button on the resource card
4. The file downloads to your device

**From your dashboard:**
1. Click the "Download" button on any of your own resource cards
2. The file downloads to your device

### 5.5 Searching for Resources

**On the public resources page (`/resources`):**
1. Type your search query in the search bar
2. Search works on resource **titles** and **subjects**
3. Results update automatically as you type (with a small delay to avoid excessive requests)
4. You can combine search with filters:
   - **Semester filter**: Click a semester number (1–8) to see only resources from that semester
   - **Resource type filter**: Select a specific type (Notes, Assignment, Quiz, etc.)
5. Click "Clear filters" to reset all filters

**On your dashboard (`/user/dashboard`):**
1. Use the search bar in the header
2. Use the semester sidebar to filter by semester
3. Use the type filter buttons above your resources

### 5.6 AI Summarization

1. On your dashboard, find a PDF or DOCX resource
2. Click the "Summarize" button (only available for PDF and DOCX files)
3. Wait for the AI to process your document (this may take a few seconds)
4. A summary appears showing the key points of your document
5. The summary includes bullet points and organized headings for easy reading

**Limitations:**
- Only works with **PDF** and **DOCX** files (not images like JPG/PNG)
- Only works on **your own** resources (not other users' public resources)
- Very large documents may be partially processed
- Scanned PDFs or image-based PDFs may not produce useful summaries

### 5.7 Deleting a Resource

1. On your dashboard, find the resource you want to delete
2. Click the delete button (trash icon) on the resource card
3. A confirmation dialog appears asking "Are you sure?"
4. Click "Delete" to confirm
5. The file is removed from cloud storage and the record is deleted
6. This action is irreversible

---

## 6. Pages & Navigation

### Public Pages (No login required)

| Page | URL | Description |
|---|---|---|
| **Home** | `/` | Landing page with hero section, features overview, how it works, benefits, and call-to-action |
| **About** | `/about` | Information about the Study Vault platform |
| **Features** | `/features` | Detailed feature descriptions |
| **Resources** | `/resources` | Browse and search all public study resources |
| **Terms of Service** | `/terms-of-service` | Legal terms for using the platform |
| **Privacy Policy** | `/privacy-policy` | How user data is collected and used |
| **Disclaimer** | `/disclaimer` | Legal disclaimers |

### Authentication Pages

| Page | URL | Description |
|---|---|---|
| **Login** | `/login` | Sign in with email/password or Google |
| **Sign Up** | `/sign-up` | Create a new account |
| **Forgot Password** | `/forgot-password` | Request a password reset email |
| **Reset Password** | `/reset-password` | Set a new password (via email link) |

### Protected Pages (Login required)

| Page | URL | Description |
|---|---|---|
| **Dashboard** | `/user/dashboard` | Personal resource management dashboard |

### Navigation Structure

**Main Navigation Bar (public pages):**
- Logo (links to home)
- Home
- Features
- Resources
- About
- Login / Sign Up (if not logged in)
- Dashboard (if logged in)

**Dashboard Navigation:**
- Top header with logo, search bar, and user profile
- Left sidebar with semester filters (1–8)
- Main content area with resource cards

---

## 7. Resource Management

### Resource Properties

Every uploaded resource has the following properties:

| Property | Description | Example |
|---|---|---|
| **Title** | Name of the resource | "OOP Final Exam Notes" |
| **Subject** | Course or subject name | "Object Oriented Programming" |
| **Semester** | Academic semester (1–8) | 3 |
| **Resource Type** | Category of the resource | Notes, Assignment, Quiz, Date Sheet, Syllabus, Past Papers |
| **File** | The uploaded file | midterm-notes.pdf |
| **File Size** | Size of the uploaded file | "2.4 MB" |
| **Upload Date** | When the resource was uploaded | "2 hours ago" |
| **Downloads** | Number of times the resource has been downloaded | 42 |
| **Published** | Whether the resource is publicly visible | Yes / No |
| **Uploader** | Username of the person who uploaded it | "zainshah" |

### Resource Visibility States

| State | On Dashboard? | On Public `/resources`? |
|---|---|---|
| **Private** (default after upload) | ✅ Yes (owner only) | ❌ No |
| **Published** | ✅ Yes (owner only) | ✅ Yes (everyone) |

### Resource Actions Available to Owner

| Action | Effect |
|---|---|
| **Publish** | Makes resource visible on public `/resources` page |
| **Unpublish** | Removes resource from public page (file is NOT deleted) |
| **Download** | Downloads the file to your device |
| **Summarize** | Generates an AI summary (PDF/DOCX only) |
| **Delete** | Permanently removes the resource and file (irreversible) |

---

## 8. Search & Filtering

### Search Behavior

- **Search fields:** Searches across resource **title** and **subject** fields
- **Case-insensitive:** "data structures" matches "Data Structures"
- **Real-time:** Results update as you type (with a short delay to reduce unnecessary requests)
- **URL-synced:** Search terms are reflected in the URL, making results shareable/bookmarkable

### Filter Options

| Filter | Options | Behavior |
|---|---|---|
| **Semester** | 1, 2, 3, 4, 5, 6, 7, 8, All | Shows only resources from selected semester |
| **Resource Type** | Notes, Assignment, Quiz, Date Sheet, Syllabus, Past Papers, All | Shows only resources of selected type |

### Filter Combinations

- Filters can be combined (e.g., Semester 3 + Notes)
- Search can be combined with filters
- Changing the semester filter clears the current search query
- Each semester filter shows a badge with the number of available resources

### Pagination

- Resources are loaded in pages (6 resources per page)
- Click "Load More" to see additional resources

---

## 9. AI Summarization Feature

### What It Does

The AI Summarization feature allows users to generate concise summaries of their uploaded documents. It uses a large language model to read the text content of a document and produce an organized summary with key points, main arguments, and important details.

### How It Works (User Perspective)

1. Upload a PDF or DOCX file to your dashboard
2. Click the "Summarize" button on the resource card
3. The system processes your document and generates a summary
4. The summary is displayed directly on the resource card
5. Summaries include headings, bullet points, and organized sections

### Supported Formats

| Format | Supported for Summarization |
|---|---|
| PDF (.pdf) | ✅ Yes |
| DOCX (.docx) | ✅ Yes |
| DOC (.doc) | ❌ No |
| JPG (.jpg/.jpeg) | ❌ No |
| PNG (.png) | ❌ No |

### Limitations

- **Only your own resources:** You can only summarize files in your own dashboard
- **Text-based files only:** Scanned PDFs (images of text) may not produce useful summaries
- **Processing time:** Large documents may take 5–15 seconds to process
- **Length limit:** Very long documents are partially processed (the system focuses on the earlier portion of the document)
- **AI accuracy:** Summaries are AI-generated and should be used as a study aid, not as a definitive source

### Summary Format

AI-generated summaries typically include:
- **Main topic/overview** — What the document is about
- **Key points** — Important facts, definitions, or concepts
- **Arguments/findings** — Main arguments or research findings
- **Section breakdown** — Organized by document sections when applicable

---

## 10. Account & Authentication

### Account Creation Methods

| Method | Description |
|---|---|
| **Email & Password** | Create account with username, email, and password (8+ characters) |
| **Google Sign-In** | One-click sign-up/login using your Google account |

### Account Types

| Type | Login Method |
|---|---|
| **Email Account** | Email + Password only |
| **Google Account** | Google Sign-In only |
| **Linked Account** | Either method works |

**Note:** If you created your account with Google and try to log in with email/password, you'll see: *"This account uses Google sign-in. Please use the Google button below."*

### Session Duration

- Login sessions last for **30 days**
- After 30 days, you'll need to log in again
- You can manually log out at any time from the dashboard

### Password Requirements

- Minimum **8 characters**

### Password Reset Process

1. Click "Forgot password?" on the login page
2. Enter the email address associated with your account
3. You'll see a confirmation message regardless of whether the email exists (for privacy)
4. If the email is registered, you'll receive a reset link
5. The reset link is valid for **1 hour**
6. After resetting, all previous reset links are invalidated

**Important:** Password reset is only available for email-based accounts. Google-only accounts don't have a password to reset.

### Profile Information

| Field | Source |
|---|---|
| Username | Set at registration (from input or Google name) |
| Email | Set at registration (from input or Google email) |
| Profile Image | Google profile picture (Google accounts only) |

---

## 11. File Handling

### Upload Process (User Perspective)

1. User selects a file and fills in resource details
2. The file is validated (type and size checks)
3. The file is uploaded directly to cloud storage from the browser
4. Progress is tracked with a real-time percentage bar
5. Once uploaded, the resource metadata is saved

**Upload Progress States:**
- "Preparing upload..." — System is getting ready
- "Uploading... 42%" — File is being transferred to cloud storage
- "Saving resource..." — Metadata is being recorded

### Download Process

1. User clicks "Download" on a resource card
2. System verifies the file exists in storage
3. The download count is incremented
4. File is delivered to the browser as a direct download

### File Naming

- Downloaded files are named using the resource title plus the original file extension
- Example: Resource titled "Data Structures Notes" with a PDF file → downloads as "Data-Structures-Notes.pdf"

---

## 12. Design & User Interface

### Visual Identity

| Aspect | Details |
|---|---|
| **Primary Color** | Warm terracotta/orange |
| **Background** | Off-white/cream |
| **Heading Font** | Outfit (sans-serif) |
| **Body Font** | Ovo (serif) |
| **Icon Set** | Lucide React (modern SVG icons) |

### Design Characteristics

- **Dark mode support** — Automatically adapts to system preference
- **Mobile responsive** — Fully functional on phones, tablets, and desktops
- **Smooth animations** — Subtle hover effects, transitions, and micro-animations
- **Card-based layout** — Resources displayed as cards with all relevant info
- **Skeleton loading** — Loading placeholders shown while data is being fetched

### Layout Patterns

**Public pages:**
- Top navigation bar with main links
- Content area
- Footer with links and information

**Dashboard:**
- Top header with search and profile
- Left sidebar with semester filter (collapsible on mobile)
- Main content area with resource cards grid

**Authentication pages:**
- Centered card with form fields
- Decorative background elements
- Brand logo and heading

---

## 13. Supported File Types & Limits

### Upload Limits

| Constraint | Value |
|---|---|
| **Maximum file size** | 20 MB per file |
| **Allowed file types** | PDF, DOCX, DOC, JPG, JPEG, PNG |

### File Type Details

| Extension | Summarizable? |
|---|---|
| `.pdf` | ✅ Yes |
| `.docx` | ✅ Yes |
| `.doc` | ❌ No |
| `.jpg` / `.jpeg` | ❌ No |
| `.png` | ❌ No |

### Resource Types (Categories)

| Type | When to Use |
|---|---|
| **Notes** | Lecture notes, class notes, study notes |
| **Assignment** | Homework, lab reports, projects |
| **Quiz** | Quiz papers, quiz solutions |
| **Date Sheet** | Exam schedules, timetables |
| **Syllabus** | Course outlines, course plans |
| **Past Papers** | Previous exams, model papers |

### Semesters

Resources are organized into **8 semesters** (representing a typical 4-year university program):
- Semester 1 through Semester 8

---

## 14. Frequently Asked Questions (FAQ)

### General

**Q: Is Study Vault free to use?**
A: Yes, Study Vault is completely free. You can browse, download, upload, and share resources without any cost.

**Q: Do I need an account to download resources?**
A: No, you can browse and download public resources without an account. However, you need an account to upload and manage your own resources.

**Q: What happens to my resources if I delete my account?**
A: Currently, account deletion is not a self-service feature. Contact the administrators for account-related requests.

### Uploading

**Q: Why can't I upload files larger than 20MB?**
A: The 20MB limit ensures fast uploads and reasonable storage usage. If your file is too large, consider compressing it or splitting it into multiple parts.

**Q: Can I upload PowerPoint files (PPT/PPTX)?**
A: No, currently only PDF, DOCX, DOC, JPG, JPEG, and PNG files are supported.

**Q: Are my uploaded resources automatically public?**
A: No. All new uploads are **private by default**. You must explicitly click "Publish" to make them visible to other users.

**Q: Can I edit a resource after uploading?**
A: You can change its visibility (publish/unpublish) or delete it, but you cannot edit the title, subject, or replace the file. If you need to make changes, delete the resource and upload a new one.

### Downloading

**Q: Why does my download count increase by 1 each time?**
A: Every time anyone (including you) downloads your resource, the download counter increases by 1.

**Q: Can I download my own resources?**
A: Yes, you can download files that you uploaded from your dashboard.

### AI Summarization

**Q: Why is the "Summarize" button grayed out?**
A: The Summarize button only works with PDF and DOCX files. If your file is a JPG, PNG, or DOC file, summarization is not available.

**Q: Can I summarize other people's resources?**
A: No, you can only summarize resources in your own dashboard.

**Q: The AI summary seems incomplete. Why?**
A: For very large documents, the system processes only the first portion. Also, scanned PDFs (images of text) cannot be processed because the system needs actual text content.

### Account

**Q: I signed up with Google but now I want to use a password instead. Can I?**
A: If your account was created via Google Sign-In, it doesn't have a password. You'll need to continue using Google to log in.

**Q: I forgot my password. How do I reset it?**
A: Go to the login page and click "Forgot password?" Enter your email, and you'll receive a reset link valid for 1 hour.

**Q: Can I change my username or email?**
A: These fields are set at registration and cannot currently be changed through the UI.

---

## 15. Glossary

| Term | Definition |
|---|---|
| **Resource** | Any study material uploaded to Study Vault (PDF, DOCX, image, etc.) |
| **Dashboard** | Personal management page where users manage their uploaded resources |
| **Publish** | Making a resource visible to all users on the public browse page |
| **Unpublish** | Making a published resource private again (only visible to the owner) |
| **Semester** | Academic semester number (1–8) used to categorize resources |
| **Resource Type** | Category of a resource: Notes, Assignment, Quiz, Date Sheet, Syllabus, Past Papers |
| **AI Summarization** | Feature that uses artificial intelligence to generate a summary of a document |
| **Load More** | Button to load additional results when browsing resources |
| **SSR** | Server-Side Rendering — pages are generated on the server for faster loading |

---

## 16. Troubleshooting Guide

### Common Issues

| Problem | Possible Cause | Solution |
|---|---|---|
| Can't upload file | File too large (>20MB) | Compress the file or use a smaller version |
| Can't upload file | Unsupported format | Use PDF, DOCX, DOC, JPG, JPEG, or PNG |
| Upload stuck at 0% | Network issue | Check your internet connection and try again |
| Download not working | File may have been deleted | The uploader may have removed the resource |
| "Summarize" button disabled | File is not PDF or DOCX | Only PDF and DOCX files can be summarized |
| Summary is empty/unhelpful | Scanned PDF or image-based | The document needs actual text, not scanned images |
| Can't log in with password | Account created via Google | Use "Continue with Google" instead |
| Reset link expired | Link older than 1 hour | Request a new reset link from the forgot password page |
| Page shows error | Temporary server issue | Refresh the page or try again in a few minutes |
| Search not returning results | Typo or no matching resources | Try different keywords; search checks title and subject |

### Error Messages Explained

| Error Message | Meaning |
|---|---|
| "Invalid email or password" | Either the email doesn't exist or the password is wrong |
| "This account uses Google sign-in" | Cannot use password login; use Google Sign-In |
| "An account with this email already exists" | That email is already registered |
| "Password must be at least 8 characters" | Password too short |
| "File type not supported" | Upload format not in the allowed list |
| "File size exceeds limit" | File is larger than 20MB |

---

## 17. Feature Descriptions for Users

### 17.1 Landing Page Experience

When you first visit Study Vault, you'll see:

1. **Hero Section** — A welcoming headline, subtitle, and buttons to get started or browse resources
2. **Features Overview** — Cards showing the platform's main capabilities
3. **How It Works** — A step-by-step visual guide: Sign Up → Upload → Share → Learn
4. **Benefits** — Why Study Vault helps solve common student problems
5. **Call to Action** — Encouragement to create a free account

### 17.2 Dashboard Experience

The dashboard is your personal hub for managing resources:

- **Top bar**: Search your resources and access your profile
- **Sidebar**: Filter by semester (shows count badges)
- **Main area**: Your resource cards in a responsive grid
- **Upload button**: Opens the upload form
- **Resource cards** show:
  - File type icon and badge (PDF, DOCX, etc.)
  - Title and subject
  - Semester number
  - File size
  - Download count
  - Upload date (relative, e.g., "2 hours ago")
  - Action buttons: Publish/Unpublish, Download, Summarize, Delete

### 17.3 Browse Resources Page

The public resources page lets anyone discover study materials:

- **Stats banner**: Shows total resources and total users
- **Search bar**: Find resources by title or subject
- **Filter controls**: Filter by semester and resource type
- **Resource cards**: Show resource info + download button
- **Load More**: Click to see additional results
- **Empty state**: Helpful message when no resources match your filters

### 17.4 Mobile Experience

Study Vault is fully responsive:
- **Navigation**: Collapses into a hamburger menu on mobile
- **Dashboard sidebar**: Becomes a slide-out overlay
- **Resource cards**: Stack vertically on small screens
- **Upload form**: Full-width modal on mobile
- **Buttons and inputs**: Touch-friendly sizing

---

## Appendix: Application URLs

| Page | URL |
|---|---|
| Home | `/` |
| About | `/about` |
| Features | `/features` |
| Browse Resources | `/resources` |
| Dashboard | `/user/dashboard` |
| Login | `/login` |
| Sign Up | `/sign-up` |
| Forgot Password | `/forgot-password` |
| Reset Password | `/reset-password` |
| Terms of Service | `/terms-of-service` |
| Privacy Policy | `/privacy-policy` |
| Disclaimer | `/disclaimer` |

---

*This document is designed for use in AI/chatbot training. It describes the Study Vault platform from a user-facing perspective without exposing internal implementation details, security mechanisms, or infrastructure configurations.*
