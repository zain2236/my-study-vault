# File Upload Process Overview

This document provides a simple, step‑by‑step description of what happens when a user uploads a file in our application.

---

## 1. User Selects a File

- The user clicks an **Upload** button or drags a file onto the upload area in the UI.
- The browser creates a `File` object representing the selected file.

## 2. Client‑Side Preparation

- The client (JavaScript) may perform lightweight validation (file type, size).
- A **pre‑signed URL** or **upload token** is requested from the backend so the file can be sent directly to cloud storage (e.g., AWS S3, Google Cloud Storage).
- The request typically includes metadata such as the file name and MIME type.

## 3. Server Generates a Pre‑Signed URL

- The server receives the request, authenticates the user, and checks any business rules.
- Using cloud‑provider SDKs, the server creates a **pre‑signed URL** that grants temporary permission to upload the file directly to the storage bucket.
- The server returns this URL (and sometimes additional fields) to the client.

## 4. Direct Upload to Cloud Storage

- The client performs an HTTP `PUT` (or `POST` for multipart) request directly to the pre‑signed URL.
- The file data streams from the user's browser to the cloud storage service, bypassing the application server.
- Because the upload goes straight to the cloud, the server is not a bottleneck and large files are handled efficiently.

## 5. Confirmation & Metadata Storage

- After a successful upload, the cloud provider returns a **200 OK** response.
- The client notifies the backend (e.g., via a `POST /files` endpoint) that the upload succeeded, sending the file’s key/path and any additional metadata.
- The server stores this information in the database, linking the file to the user or related entity.

## 6. Client UI Update

- The UI shows the uploaded file (thumbnail, name, size) and may provide options to view, download, or delete it.
- Errors at any stage (validation, pre‑signed URL request, upload failure) are displayed to the user with appropriate messages.

---

### Quick Diagram (textual)

```
User -> Browser (select file) -> Browser (request pre‑signed URL) -> Server (auth & generate URL) -> Server returns URL -> Browser (PUT file to cloud) -> Cloud storage (stores file) -> Browser (notify server) -> Server (save metadata) -> UI updates
```

---

**Key Points**

- **Pre‑signed URL** keeps the server lightweight and secure.
- Direct upload to cloud improves performance and scalability.
- The server only stores metadata, not the file itself.
- Proper error handling at each step ensures a smooth user experience.
