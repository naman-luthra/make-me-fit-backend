# Make Me Fit - Backend Repository

<img src="https://raw.githubusercontent.com/naman-luthra/make-me-fit-ui/main/public/img/logo.png" width="30%">

Welcome to the Make Me Fit backend repository! This README will guide you through the setup and usage of the backend application, which powers the AI-enhanced health tracking app designed to help users create personalized diet plans and workout routines tailored to their preferences, goals, and body using OpenAI's API.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Running the Server](#running-the-server)
  - [Accessing the Application](#accessing-the-application)

## Introduction

Make Me Fit's backend application serves as the foundation for the AI-powered health tracking app. It handles user authentication, diet plan generation, workout routine generation, and exercise tracking.

## Features

- User Authentication: Secure user registration and login using authentication tokens.
- Diet Plan Generation: Generate personalized diet plans based on user preferences.
- Workout Routine Generation: Create customized workout routines aligned with user goals and body type.
- Exercise Tracking: Log and track daily exercise activities.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (including npm)
- [MySQL](https://www.mysql.com/)

### Installation

Follow these steps to set up the backend application:

1. Clone the repository to your local machine using the following command:
   ```sh
   git clone https://github.com/naman-luthra/make-me-fit-backend
2. Navigate to the project directory:
   ```bash
   cd make-me-fit-backend
3. Install the required npm packages by running:
   ```bash
   npm install

### Configuration

1. Open the Setup.sql file and execute all the queries to set up the necessary database schema.
2. Create a .env file in the project directory and populate it with the following keys:
   ```
   JWT_SECRET=random_secret
   DB_URI=db_connection_string
   OPENAI_API_KEY=your_openai_api_key
   ```

## Usage

### Running the Server

To start the DNS server, use the following command:
    ```sh
       npm run start

### Accessing the Application

Once the server is running, you can access the api on url `localhost:8080`

