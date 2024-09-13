# Feedback Circle

## Index

- [Feedback Circle](#feedback-circle)
  - [Index](#index)
  - [1. Project Overview](#1-project-overview)
  - [2. Getting Started](#2-getting-started)
    - [2.1 Prerequisites](#21-prerequisites)
    - [2.2 Installing Dependencies](#22-installing-dependencies)
    - [2.3 Setting up the Database](#23-setting-up-the-database)
      - [2.3.1 Create an Environment File](#231-create-an-environment-file)
      - [2.3.2 Create and Populate the Database](#232-create-and-populate-the-database)
    - [2.4 Running the Server](#24-running-the-server)
    - [2.5 Running the UI](#25-running-the-ui)
  - [3. Developer Guide](#3-developer-guide)
    - [3.1 Architecture Overview](#31-architecture-overview)
      - [3.1.1 Server Folder](#311-server-folder)
      - [3.1.2 UI Folder](#312-ui-folder)
    - [3.2 Authentication](#32-authentication)
    - [3.3 Component Overview](#33-component-overview)
      - [3.3.1 Creating a New Component](#331-creating-a-new-component)
    - [3.4 Database Overview](#34-database-overview)
      - [3.4.1 Table Structure](#341-table-structure)
      - [3.4.2 Managing the Schema](#342-managing-the-schema)
      - [3.4.3 Schema Impact on the API](#343-schema-impact-on-the-api)
    - [3.5 Feedback System Overview](#35-feedback-system-overview)
      - [3.5.1 Types of Feedback](#351-types-of-feedback)
      - [3.5.2 Feedback Flow](#352-feedback-flow)
      - [3.5.3 Security and Visibility](#353-security-and-visibility)
  - [4. Known Issues](#4-known-issues)
  - [5. Features to be Added](#5-features-to-be-added)
    - [5.1 Expansion Ideas](#51-expansion-ideas)
    - [5.2 Quality of Life Improvements](#52-quality-of-life-improvements)

## 1. Project Overview

The Feedback Circle App is a web-based tool designed to streamline the performance appraisal process within the company. It allows managers, appraisers, and employees to give, track, and manage feedback easily and efficiently. The system supports both performance appraisal feedback (for appraisers) and continuous feedback (for managers). The app is aimed at providing a centralized platform for managing employee performance.

## 2. Getting Started

This section will guide you through setting up the project and running both the server and the UI.

### 2.1 Prerequisites

Before you start, ensure that you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)
- Any modern web browser (e.g., Chrome, Firefox)
- [Live Server](https://www.npmjs.com/package/live-server) installed globally on your machine (you can install it via `npm install -g live-server` if not already installed)

### 2.2 Installing Dependencies

Once you’ve set up the prerequisites, follow the steps below to install dependencies.

1. **Server Dependencies**:

   - Navigate to the `server` folder in the root of the project.
   - Run the following command to install all necessary dependencies for the server:

   ```bash
   npm install
   ```

   This will install all packages defined in the `package.json` file for the server.

2. **Client Dependencies**

   There currently are no dependencies for the UI

### 2.3 Setting up the Database

Before running the project, the user must set up the database. Follow these steps to properly configure and initialize the database:

#### 2.3.1 Create an Environment File

1. Navigate to the `server` folder in the root of the project.
2. Create a `.env` file with the following format. This file will store the MySQL credentials needed for database connection:

   ```env
   MYSQL_HOST=host
   MYSQL_USER=user
   MYSQL_PASSWORD=password
   MYSQL_DATABASE=performance_feedback_circle
   ```

   - Replace `host`, `user` and `password` with the appropriate values.
   - Use `127.0.0.1` for `MYSQL_HOST` if the database is hosted locally.

#### 2.3.2 Create and Populate the Database

Once the `.env` file is properly set up, the user needs to create the database schema and populate it with dummy data from an Excel sheet.

1. Ensure you have Python installed and the required dependencies. You can install them by running:

   ```bash
   pip install pandas mysql-connector-python python-dotenv icecream
   ```

2. To create and populate the database:

   - Navigate to the `server/database/schema` folder.
   - Run the Python script `schema.py` to create the database and populate it with dummy data from the `cmf_users.xlsx` Excel file.

   Command to run the script:

   ```bash
   python ./schema.py
   ```

   This script will create the `performance_feedback_circle` database and populate it with data from the provided Excel file, `cmf_users.xlsx`.

### 2.4 Running the Server

To run the server, follow these steps:

1. Navigate to the `server` folder under the root of the project.
2. Run the `start_server.cmd` file to start the server. This file contains the command to run the server in development mode using npm. Simply double-click the file or run it from the terminal:

   ```bash
   start_server.cmd
   ```

   What this does is execute the following command internally:

   ```bash
   npm run dev
   ```

   This will start the development server, and it will be listening for incoming requests.

### 2.5 Running the UI

To start the UI, follow these steps:

1. Navigate to the `ui` folder under the root of the project.
2. Run the `start_ui.cmd` file to start the UI. This file contains the command to launch `live-server`. You can either double-click the file or run it from the terminal:

   ```bash
   start_ui.cmd
   ```

   This will execute the following command internally:

   ```bash
   live-server.cmd .
   ```

   `live-server` will automatically start a server to serve the front-end files and open the application in your default web browser.

## 3. Developer Guide

### 3.1 Architecture Overview

The project is organized into two main folders: `server` and `ui`.

#### 3.1.1 Server Folder

The `server` folder is responsible for managing the API and database operations. The API is a REST API that handles communication between the client-side (UI) and the database.

- **app.js**: This file contains the entire API logic. It handles all the API routes and processes requests such as creating, reading, updating, and deleting feedback, as well as reading users. It serves as the core of the back-end service.

- **database folder**:

  - The `database` folder contains all the database logic.
  - **database.js**: This file houses the SQL queries used by the API to interact with the database (e.g., to retrieve or insert feedback).
  - **schema folder**: Inside the `database` folder is a `schema` folder that contains the `schema.py` Python script, which is used to create and populate the database from an Excel file. Additionally, there are some `.sql` files that are used by the Python script for creating and seeding the database with dummy data.

- **auth.js**: This file was an attempt to implement a proper authentication system. However, due to time constraints, the logic was never completed, and this file remains unused in the current state of the project.

#### 3.1.2 UI Folder

The `ui` folder serves as the client-side of the application and is built using JavaScript, HTML, and CSS. It does not rely on any frameworks, and all functionality is handled natively. This structure provides a simple, lightweight solution for rendering the front-end and handling user interactions with the API.

Here’s a breakdown of its key elements:

- **index.html** and **index.js**:  
  These are the main entry points of the project. The `index.html` file is the starting point of the UI, and it references `index.js`, which initializes and drives the core application logic. Together, they serve as the "pivot" for the entire project, handling the main user interactions and rendering the interface.

- **assets folder**:  
  This folder contains all the static assets used by the UI, including:

  - **CSS files**: Stylesheets that define the layout and design of the application.
  - **Images**: Any graphical elements included in the user interface.
  - **Icons**: All icons are from [Font Awesome](https://fontawesome.com/), providing a library of scalable vector icons for use in the UI, and are all stored in the `fonts` folder.

- **components folder**:  
  This folder holds all the UI components. The application is built in a **component-based** architecture, where each tab is a separate component. Components are loaded dynamically based on user interactions and routing logic.

- **modules folder**:  
  The `modules` folder handles various utility functions and essential features required across the application. Its purpose is to organize the following functionalities:

  - **Error handling**: Displaying and managing error messages throughout the UI.
  - **Progress indicators**: Showing loading states during asynchronous tasks.
  - **API request management**: Sending and receiving data from the server.
  - **Confirmation windows**: Managing user confirmations for critical actions (e.g., deleting and sharing feedback).
  - **Authentication**: Handling the simplified authentication process.
  - **Toast notifications**: Displaying brief pop-up notifications to the user.
  - **Tab management**: Ensuring the correct rendering and functionality of the tabbed navigation system.

- **routes folder**:  
  This folder manages the **routing** of the application, ensuring that each tab or link corresponds to its respective component. It controls which components are loaded based on user interactions.

- **utilities folder**:  
  A collection of utility functions and helper classes, including JavaScript objects and methods that are used throughout the application.

### 3.2 Authentication

The authentication system for this project is a simplified mechanism handled entirely on the client-side.

- **session.js**: In the `ui/modules` folder, the file `session.js` contains the logic for authentication. It checks whether the email input by the user corresponds to any email in the database. Upon entering an email, a request is sent to the API, which verifies whether the email exists in the `users` table of the database.

Currently, no password logic is implemented. This means that users can "log in" using just their email address, bypassing any further validation. This simple approach was adopted due to time constraints, but it can be extended in the future to include password handling, token-based authentication, or more robust security measures.

### 3.3 Component Overview

Each tab the user interacts with corresponds to a unique component in the code. Components are responsible for rendering the content within the tabs and managing user interactions related to that specific part of the UI.

#### 3.3.1 Creating a New Component

To create a new component for your application, follow the steps below:

1. **Create a Folder for the Component**:  
   In the `ui/components` folder, create a new subfolder for your component, naming it after your component. For example, if your component is called "MyComponent", the folder should be named `my-component`. Inside this folder, add the following two files:

   - **my-component.component.html**: This file will contain the HTML markup for the component.
   - **my-component.component.js**: This file will contain the JavaScript logic for the component.

2. **Define the Component's JavaScript**:  
   In the `my-component.component.js` file, use the following template for creating your component:

   ```js
   "use strict";

   import BaseComponent from "../base/base.component.js";

   export default class MyComponentComponent extends BaseComponent {
     selector = "my-component"; // The selector must match the folder and HTML/JS file names

     onInit(isRefresh = false) {
       super.onInit(); // Call the parent class's initialization method

       // Custom initialization logic for your component goes here

       if (!isRefresh) this.addEventListeners();
     }

     // If your component does not have event listeners, you may remove this method
     addEventListeners() {
       // All event listeners should be inside this method
     }
   }
   ```

   - **BaseComponent**: This is a base class that all components extend from, providing shared functionality like rendering, lifecycle management, etc.
   - **selector**: The `selector` property is essential and must match the folder name, HTML file name, and JavaScript file name.
   - **onInit()**: The `onInit()` method is where you place any custom logic for initializing the component.
   - **isRefresh**: This prevents event listeners from multiplying when the page is refreshed, by only creating the event listeners for the tab when the tab is instantiated for the first time.

3. **Update the Routes**:  
   After creating the component, you need to ensure that the application can route to it. In the `routes/routes.js` file, add a new route that links a URL path to your component class. This allows the app to display the component when the corresponding tab or link is clicked.

   Example:

   ```js
   import MyComponentComponent from "../components/my-component/my-component.component.js";

   const Routes = {
     ...,
     URLForMyComponent: MyComponentComponent, // Add your component here
     ...,
   };
   ```

### 3.4 Database Overview

The database structure is built to store and manage feedback-related data for users, including feedback content, visibility settings, and user roles. The schema is organized into multiple tables, each responsible for a distinct part of the system.

You can view the full schema and relationships of the database tables on **[DrawSQL](https://drawsql.app/teams/cm-13/diagrams/performance-feedback-circle)**. Here, you'll find all table columns, their data types, default values, and properties such as whether a column is nullable, a primary key, or a unique key.

#### 3.4.1 Table Structure

1. **users**  
   This table stores information about the users in the system, including their unique IDs, names, email addresses, and encrypted passwords. It also tracks who their appraiser is, and whether there are any specific appraiser notes related to their performance.

2. **user_access**  
   This table defines the access levels of each user. The four boolean fields (`user`, `appraiser`, `manager`, and `admin`) determine the user's role in the system, which influences what feedback they can access and provide.

3. **pinned_users**  
   This table keeps track of users that are "pinned" by other users, allowing for quicker access to those individuals when writing feedback. It holds the `user_id` and `pinned_user_id` fields, which create a connection between users.

4. **feedbacks**  
   The core table of the application. It contains the actual feedback data, including:

   - **sender_id**: The user who sent the feedback.
   - **target_id**: The user to whom the feedback is addressed.
   - **responsible_id**: The person responsible for acting on the feedback (continuous feedback only).
   - **positive_message**, **negative_message**, and their corresponding appraiser edits, which allow appraisers to modify feedback before it becomes visible.
   - **rating** and **competency**, which track performance evaluations.
   - **is_read_target**, **is_read_appraiser**, and **is_read_manager** fields to mark whether the feedback has been reviewed by the involved parties.

5. **feedback_visibility**  
   This table is responsible for managing who can view each feedback entry. It contains boolean fields (`sender`, `target`, `appraiser`, and `manager`) that determine who has visibility of the feedback.

#### 3.4.2 Managing the Schema

Currently, there is **no way to alter the schema** of the database without recreating it from scratch. The schema is defined in the file `create_tables.sql`, that is run by the Python script (`schema.py`), which creates the database and populates it with dummy data from an Excel file (`cmf_users.xlsx`). Any manual changes to the structure (such as adding, removing, or modifying columns) require running the script again, effectively erasing all current data and recreating the database.

#### 3.4.3 Schema Impact on the API

Most filtering for sensitive or private information happens in the **API (app.js)** after querying the database. This means that even though the data may be present in the database, it is the API that determines what gets exposed to the user based on their access level.

Because of this design, **altering the schema** of the database without updating the API could lead to significant issues, including:

- **Security Risks**: Exposing private data unintentionally.
- **Breaking the API**: The API relies heavily on the existing schema. Any changes, especially removing or renaming columns, could break routes or introduce bugs that may prevent the application from functioning correctly.

If you alter a table in any way, review all functions that query that table in `database.js` and all routes that call those functions in `app.js`.

### 3.5 Feedback System Overview

Feedback is the core feature of the **Feedback Circle** project. It allows users to share performance-related insights in a structured and meaningful way, with two types of feedback mechanisms: **Performance Appraisal** and **Continuous Feedback**. Feedback flows through the application, where different user roles interact with it according to their access permissions.

This section will cover how feedback is structured, how it traverses through the system, the differences between the two types of feedback, and how it is handled in the app, both programmatically and conceptually.

#### 3.5.1 Types of Feedback

1. **Performance Appraisal Feedback**  
   This type of feedback is designed for more formal, structured evaluation and is used during the annual performance appraisal cycle. The key characteristics are:

   - **Who can give it**: Anyone in the company can write a performance appraisal for any other employee, except themselves.
   - **Saving as Draft**: The feedback can be saved as a draft for later completion. Drafts can be edited or deleted only by the creator.
   - **Sharing**: Once shared, the feedback becomes visible to the **appraiser** of the feedback's target. The appraiser's role is to review and refine the feedback before using it during the target’s performance evaluation.
   - **Appraiser’s Editing**: The appraiser can edit specific fields (e.g., the positive/negative messages) to ensure the feedback is professional and constructive.
   - **Further Sharing**: After the appraiser has reviewed and possibly edited the feedback, they can share it with the **target** (the employee who is being evaluated) and their **manager**. At this stage, the target and manager can only view the feedback.

2. **Continuous Feedback**  
   Continuous feedback is less formal and focuses on the day-to-day or ongoing performance of employees. Its purpose is to help managers track and support the continuous development of their team members.
   - **Who can give it**: Only managers can write continuous feedback, and it can only be about employees on their own team.
   - **Appraiser Involvement**: If a manager wishes, they can share continuous feedback with the **appraiser** of the target employee, who can edit the feedback in the same manner as with performance appraisals.
   - **Sharing**: After the appraiser has reviewed and edited the feedback, it can be shared with the **target** employee to make them aware of their progress.

For a visual understanding of how feedback traverses the application, refer to the [flowchart](https://miro.com/app/board/uXjVKmzKTN8=/) that outlines the flow for both types of feedback.

#### 3.5.2 Feedback Flow

Feedback flows through the application in the following steps, whether it's **Performance Appraisal** or **Continuous Feedback**:

1. **Creation**:  
   All feedback is created in the **WriteFeedback** component, which provides the interface for writing, saving, and sharing feedback. The feedback is stored in the database upon saving or sharing.

2. **Access and Viewing**:  
   Once created, feedback can be accessed in the **Feedback** component, which is responsible for displaying the feedback content. Each feedback entry has a unique `feedback_id`, which is passed as a parameter to the **Feedback** component to load the correct feedback details for viewing.

3. **Sharing and Editing**:  
   Depending on the type of feedback and the role of the user (e.g., manager, appraiser), different actions can be performed, such as editing, deleting or sharing the feedback. This flow ensures that feedback reaches the relevant stakeholders (target, appraiser, manager) at different stages.

#### 3.5.3 Security and Visibility

To ensure privacy and appropriate access, each feedback has visibility restrictions managed by the **feedback_visibility** table. This table contains boolean fields (`sender`, `target`, `appraiser`, and `manager`) that control who can see the feedback at different stages of the review process.

- **Visibility in App.js (API Layer)**:  
   The visibility of feedback is primarily controlled at the API level, where logic within **app.js** checks the user role (sender, target, appraiser, manager) and returns the appropriate feedback data. For example, the target of the feedback will not see it until the appraiser has shared it with them.

## 4. Known Issues

The current version of the project contains a few known bugs related to error handling and stability:

1. **Error Handling in Request Manager**:  
   When an error occurs in database queries (within `database.js`) or in the route functions (within `app.js`), the app may crash. These crashes can affect either the client, the server, or both. Currently, there is no proper error handling mechanism in place to catch and respond to these failures (in most cases).

   **Solution**: Adding comprehensive error handling both in the API (`app.js`) and the `requests.js` module will help to mitigate these issues and provide better stability.

## 5. Features to be Added

### 5.1 Expansion Ideas

1. **EditFeedback Component**:  
   The "Edit" button in the Feedback component is currently non-functional. A new **EditFeedback** component should be created to allow users to edit feedback.

2. **Real Authentication System**:  
   The current authentication relies solely on email verification. A proper authentication system using CMF credentials should be implemented.
3. **User Guide Component**:  
   A new component should be developed to guide users on how to use the tool. This should include:

   - Instructions on how feedback works.
   - Step-by-step tutorials for creating and sharing feedback.
   - An explanation of the different fields in the feedback form.

4. **Appraiser Feedback Requests**:  
   Appraisers should have the ability to request feedback from other users about their appraisees.

5. **Notification System**:  
   There are no notification system implemented in the project. Notifications should be sent to users when:

   - A feedback is shared with them.
   - A user is requested to give feedback on an appraisee.

### 5.2 Quality of Life Improvements

1. **Field Clearing After Actions**:

   - On the authentication page, the input fields should clear after the user logs in.
   - In the WriteFeedback component, all fields should reset after the feedback is successfully saved or shared.

2. **Submission Date Update**:  
   When a feedback that was previously saved as a draft is shared with the appraiser, the `submission_date` column should be updated to reflect the new date.
