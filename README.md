# My YouTube-like App

Welcome to the repository for my YouTube-like app! This project is an attempt to create a video-sharing platform inspired by YouTube. It aims to provide users with a space to upload, view, and interact with videos.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This application mimics the core functionalities of YouTube, allowing users to:

- **Upload videos**
- **Watch videos**
- **Comment on videos**
- **Like and dislike videos**
- **Create playlists**

The goal is to build a platform that is scalable, user-friendly, and offers an experience resembling popular video-sharing services.

---

## Features

- **User Authentication**: Users can sign up, log in, and manage personal accounts.
- **Video Upload**: Upload high-quality videos, complete with descriptions and tags.
- **Video Playback**: Viewers can watch videos with controls for play, pause, and full-screen mode.
- **Comments and Likes**: Users can interact by leaving comments and liking or disliking content.
- **Playlists**: Organize favorite videos into playlists for better viewing experiences.

---

## Technologies

This project leverages the following technologies:

- **Frontend**: HTML, CSS, JavaScript (React)
- **Backend**: Node.js, Express
- **Database**: MongoDB(Cloud)
- **File Storage**: Cloudinary
- **Authentication**: JWT, bcrypt
- **Others**: 
  - Multer for file uploads
  - i18next for internationalization

---

## Setup

To get started with the project, follow these steps:

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/ram-vinay-thakur/Youtube
    ```

2. **Install Dependencies**:
    Navigate to the project directory and install the necessary dependencies:
    ```bash
    cd Youtube
    npm install
    ```

3. **Environment Variables**:
   Create a `.env` file in the root directory and add the following environment variables:
    ```
    CLOUDINARY_CLOUD_NAME=your-cloud-name
    CLOUDINARY_API_KEY=your-api-key
    CLOUDINARY_API_SECRET=your-api-secret
    JWT_SECRET=your-jwt-secret
    MONGODB_URI=your-mongodb-uri
    MONGO_PASSWORD=your-mongodb-password
    DB_NAME=your-db-name
    PORT=your-specified-port
    CORS_ORIGIN=your-allowed-sources
    ACCESS_TOKEN_SECRET=your-access-token
    ACCESS_TOKEN_EXPIRY=your-specified-time
    REFRESH_TOKEN_SECRET=your-refresh-token
    REFRESH_TOKEN_EXPIRY=your-specified-time
    ```

4. **Run the Server**:
    ```bash
    npm start
    ```

The backend server will start on `http://localhost:5000` (or another port if specified).

---

## Usage

After setting up the project:

- **Frontend**: The Frontend will be top notch and Users experience will be great.
- **Upload Videos**: Upload videos using the dedicated upload page, add tags, and descriptions.
- **Interact with Videos**: Watch uploaded videos, leave comments, and engage with the content by liking or disliking.
  
---

## Contributing

If you'd like to contribute, feel free to fork the repository and create a pull request. All contributions are welcome!

---

## License

This project is licensed under the MIT License.