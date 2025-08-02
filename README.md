# Digital Wallet Backend API

## Project Overview

This project is a secure, modular, and role-based backend API for a digital wallet system, inspired by services like Bkash or Nagad. It's built using Express.js and Mongoose, providing a robust platform for users to manage their wallets and perform various financial transactions.

The API is designed with a focus on security and scalability, implementing a modular architecture with role-based access control to ensure that only authorized users can perform specific actions.

## Live Demo

The backend API is deployed and accessible at:
[digital-wallet-backend-phi.vercel.app/api/v1](https://digital-wallet-backend-phi.vercel.app/api/v1)

## Features

### Authentication & Authorization

- **JWT-based Authentication**: Secure user login using JSON Web Tokens.
- **Password Hashing**: Passwords are securely stored using `bcrypt`.
- **Role-based Authorization**: Three distinct roles are supported: `admin`, `user`, and `agent`, with specific permissions for each.

### Wallet & Transaction Management

- **Automatic Wallet Creation**: A wallet is automatically created for each user and agent upon registration, with an initial balance of ৳50.
- **Secure Transactions**:
  - Users can perform `send-money`, `cash-out`, `top-up`, and `withdraw-money` transactions.
  - Agents can perform `cash-in` and `cash-out` for users.
- **Transaction History**: Users and agents can view their own transaction history. Admins can view all transactions.

### Role-Specific Functionality

#### User

- **`top-up`**: Add money to their own wallet.
- **`withdraw-money`**: Withdraw money from an ATM.
- **`send-money`**: Send money to another user.
- **`agent-application`**: Submit an application to become an agent.
- **`get own-transactions`**: View personal transaction history.

#### Agent

- **`cash-in`**: Deposit money into a user's wallet.
- **`cash-out`**: Withdraw money from a user's wallet.
- **`get own-transactions`**: View personal transaction history.

#### Admin

- **`get all-users`**: View all registered users.
- **`get all-agents`**: View all approved agents.
- **`get agent-applications`**: View all pending agent applications.
- **`approve-agent`**: Approve a user's application to become an agent.
- **`suspend-agent`**: Suspend an approved agent.
- **`get all-wallets`**: View all wallets in the system.
- **`block-wallet`**: Block a user's wallet.
- **`get all-transactions`**: View all transactions.

## API Endpoints

All API endpoints are prefixed with `/api/v1`.

### `auth`

| Method | Endpoint                | Description               | Roles  |
| ------ | ----------------------- | ------------------------- | ------ |
| `POST` | `/api/v1/auth/register` | Register a new user       | Public |
| `POST` | `/api/v1/auth/login`    | Log in a user/agent/admin | Public |
| `GET`  | `/api/v1/auth/logout`   | Log out the current user  | All    |

---

### `user`

| Method | Endpoint                 | Description             | Roles |
| ------ | ------------------------ | ----------------------- | ----- |
| `GET`  | `/api/v1/user/all-users` | Get a list of all users | Admin |

---

### `agent`

| Method  | Endpoint                           | Description                              | Roles |
| ------- | ---------------------------------- | ---------------------------------------- | ----- |
| `POST`  | `/api/v1/agent/agent-application`  | Submit an application to become an agent | User  |
| `GET`   | `/api/v1/agent/all-agents`         | Get a list of all approved agents        | Admin |
| `GET`   | `/api/v1/agent/agent-applications` | Get a list of all agent applications     | Admin |
| `PATCH` | `/api/v1/agent/approve-agent/:id`  | Approve an agent application             | Admin |
| `PATCH` | `/api/v1/agent/suspend-agent/:id`  | Suspend an agent                         | Admin |
| `POST`  | `/api/v1/agent/cash-in-agent/:id`  | Agent adds money to a user's account     | Admin |

---

### `wallet`

| Method  | Endpoint                          | Description               | Roles |
| ------- | --------------------------------- | ------------------------- | ----- |
| `GET`   | `/api/v1/wallet/`                 | Get a list of all wallets | Admin |
| `PATCH` | `/api/v1/wallet/block-wallet/:id` | Block a user's wallet     | Admin |

---

### `transaction`

| Method | Endpoint                               | Description                               | Roles       |
| ------ | -------------------------------------- | ----------------------------------------- | ----------- |
| `POST` | `/api/v1/transaction/send-money`       | Send money to another user                | User        |
| `POST` | `/api/v1/transaction/cash-in`          | Agent deposits money into a user's wallet | Agent       |
| `POST` | `/api/v1/transaction/cash-out`         | User withdraws money from a user's wallet | User        |
| `POST` | `/api/v1/transaction/top-up`           | User adds money to their own wallet       | User        |
| `POST` | `/api/v1/transaction/withdraw-money`   | User withdraws from an ATM                | User        |
| `GET`  | `/api/v1/transaction/all-transactions` | Get a list of all transactions            | Admin       |
| `GET`  | `/api/v1/transaction/own-transactions` | Get personal transaction history          | User, Agent |

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JSON Web Tokens (JWT), `bcrypt`
- **Validation**: Zod (for request validation)

## Setup and Environment Instructions

To run this project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <project_folder>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment variables:**
    Create a `.env` file in the root directory and configure the following variables:

```bash
PORT=5000
NODE_ENV=development

# MongoDB Connection

DB_URL=mongodb+srv://<username>:<password>@<cluster>/<db-name>?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration

JWT_ACCESS_SECRET=your_access_secret_key
JWT_ACCESS_EXPIRES=10d

JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES=30d

# Security

BCRYPT_SALT_ROUND=10

# Admin Seed Info

ADMIN_PHONE=your_admin_phone_number
ADMIN_PASSWORD=your_admin_password
```

4.  **Run the server:**
    ```bash
    npm run start:dev
    ```
    The server will start at `http://localhost:5000`.

## Project Structure

The project follows a modular architecture for clarity and maintainability.J

```
src/
├── app/
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── wallet/
│   │   ├── agent/
│   │   └── transaction/
│   ├── config/
│   ├── errorHandlers/
│   ├── interfaces/
│   ├── middlewares/
│   ├── routes/
│   └── utils/
├── .env
├── .gitignore
├── package.json
└── tsconfig.json



```


## Postman Collection

A Postman collection with documented requests for all API endpoints is available for testing. You can import the collection to easily test the API's functionality.

## Video Demonstration

A screen-recorded video demonstration (max 10 minutes) showcasing the project's features and functionality is available here. The video covers:
- A brief introduction and project overview.
- An explanation of the folder structure.
- The authentication and authorization flow (register, login, JWT).
- Demonstrations of key features for users, agents, and admins.
- Live API testing using Postman.

Thank you for your interest in the Digital Wallet API project!
