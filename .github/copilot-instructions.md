# Feedback Circle - AI Coding Instructions

## 🏗 Architecture Overview

- **Monolith Structure**:
  - `server/`: Node.js/Express REST API (ESM). Entry: [server/app.js](server/app.js).
  - `ui/`: Vanilla JS SPA. Entry: [ui/index.js](ui/index.js).
- **Data Flow**: `UI Components -> RequestManager (ui/modules/requests/requests.js) -> Express API -> MySQL (server/database/database.js)`.
- **Authentication**: Email verification in [ui/modules/session/session.js](ui/modules/session/session.js). No passwords implemented.

## 💻 Critical Workflows

- **Backend**: `cd server && npm install && npm run dev`.
- **Frontend**: `cd ui && live-server .`.
- **Database Reset**: `python server/database/schema/schema.py` (Resets DB & seeds from `cmf_users.xlsx`).
- **Dependencies**: Requires `.env` in `server/` with `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.

## 🎨 UI Component Conventions (Custom Framework)

- **Structure**: Each component in `ui/components/{name}/` with `{name}.component.html` and `{name}.component.js`.
- **Implementation**:
  - Must extend `BaseComponent` from [ui/components/base/base.component.js](ui/components/base/base.component.js).
  - `selector` MUST match folder and filename (e.g., `selector = "my-component"` for `ui/components/my-component/`).
  - **Lifecycle**: `onInit(isRefresh)`. Use `isRefresh` check before adding event listeners to prevent duplicates during tab switching.
  - **DOM Scoping**: Use `this.getElementById('id')` instead of `document.getElementById` to target elements within the component.
- **Routing**: Register in [ui/routes/routes.js](ui/routes/routes.js).

### Example Component Pattern

```javascript
export default class MyComponent extends BaseComponent {
  selector = "my-component";
  pageTitle = "My Page";
  pageIcon = "fa-star";
  access = ["user", "admin"]; // Role-based access

  onInit(isRefresh = false) {
    super.onInit();
    if (!isRefresh) this.addEventListeners();
  }
}
```

## 🛠 Backend & Database Conventions

- **SQL Locality**: All SQL queries must reside in [server/database/database.js](server/database/database.js).
- **Security/Visibility**:
  - The `feedbacks` table uses flags: `sender_visibility`, `target_visibility`, `appraiser_visibility`, `manager_visibility`.
  - ALWAYS filter sensitive data in [server/app.js](server/app.js) based on the `userId` and these visibility flags.
  - Never return raw database objects to the UI without role-based stripping.
- **Error Handling**: Currently weak. Implement try-catch in routes and return 400/404/500 status codes.

## ⚠️ Important Considerations

- **Tabs Management**: Handled in [ui/modules/tabs/tabs.js](ui/modules/tabs/tabs.js). Routing to `#/{Component}` opens/switches tabs.
- **Icons**: Uses FontAwesome 4.7.0 (locally stored in `ui/assets/fonts`).
- **Schema Management**: Managed via Python. Manual SQL changes require updating `create_tables.sql` and re-running `schema.py`.
