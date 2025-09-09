# Google Drive & Sheets Integration Setup Guide

## Overview

This comprehensive guide will walk you through setting up Google Drive and Google Sheets integration with your Market Access Management System, ensuring seamless synchronization of company data, legal documents, and analytics.

## Prerequisites

- Google Cloud Console account with billing enabled
- Administrative access to your Google Workspace (if using organizational account)
- Access to your Market Access Management System

## Phase 1: Google Cloud Console Setup

### 1.1 Create a New Project

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "NEW PROJECT"
3. Project name: `market-access-management`
4. Organization: Select your organization (if applicable)
5. Click "CREATE"

### 1.2 Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Enable the following APIs:
   - **Google Drive API**
   - **Google Sheets API** 
   - **Google Workspace Admin SDK** (for organizational accounts)

For each API:
- Search for the API name
- Click on the API
- Click "ENABLE"

### 1.3 Create Service Account (For Server-to-Server Access)

1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "Service account"
3. Service account details:
   - Name: `market-access-service`
   - Description: `Service account for Market Access Management System`
4. Click "CREATE AND CONTINUE"
5. Grant roles:
   - Add "Editor" role for Drive access
   - Add "Viewer" role for basic access
6. Click "CONTINUE" → "DONE"

### 1.4 Generate Service Account Key

1. In "Credentials", find your service account
2. Click on the service account email
3. Go to "Keys" tab
4. Click "ADD KEY" → "Create new key"
5. Select "JSON" → "CREATE"
6. **Important**: Save this file securely - it contains your private key

### 1.5 Create OAuth 2.0 Client ID (For User Authentication)

1. In "Credentials", click "CREATE CREDENTIALS" → "OAuth client ID"
2. If prompted, configure the OAuth consent screen:
   - Choose "Internal" for Google Workspace users, "External" for general use
   - Fill in application name: `Market Access Management`
   - Add your domain to authorized domains
3. Application type: "Web application"
4. Name: `Market Access Web Client`
5. Authorized redirect URIs:
   - Add: `https://your-domain.com/auth/google/callback`
   - For development: `http://localhost:5000/auth/google/callback`
6. Click "CREATE"
7. **Save the Client ID and Client Secret**

## Phase 2: Google Drive Setup

### 2.1 Create Root Folder Structure

1. Open [Google Drive](https://drive.google.com)
2. Create a main folder: `Market Access Management`
3. Inside this folder, create:
   ```
   Market Access Management/
   ├── Companies/
   ├── Templates/
   │   ├── Legal Documents/
   │   ├── Contracts/
   │   └── Reports/
   ├── Reports/
   └── Archive/
   ```

### 2.2 Share Folders with Service Account

1. Right-click the "Market Access Management" folder
2. Click "Share"
3. Add your service account email (found in the JSON key file)
4. Set permission to "Editor"
5. Uncheck "Notify people"
6. Click "Share"

### 2.3 Get Folder IDs

1. Open each folder in Google Drive
2. Copy the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
3. Save these IDs - you'll need them for configuration

## Phase 3: Google Sheets Setup

### 3.1 Create Master Tracking Sheets

Create the following Google Sheets:

#### 3.1.1 Companies Master Sheet
1. Create new Google Sheet: "Companies Master Data"
2. Set up columns:
   ```
   A: Company ID
   B: Company Name
   C: Sector
   D: Team Size
   E: Current Markets
   F: Target Markets
   G: Primary Contact Name
   H: Primary Contact Email
   I: Status
   J: Last Updated
   K: Drive Folder ID
   L: Registration Status (JSON)
   ```

#### 3.1.2 Legal Needs Tracking Sheet
1. Create new Google Sheet: "Legal Needs Tracking"
2. Set up columns:
   ```
   A: Legal Need ID
   B: Company Name
   C: Category
   D: Title
   E: Priority
   F: Status
   G: Assigned To
   H: Expected Completion
   I: Progress %
   J: Description
   K: Related Documents
   ```

#### 3.1.3 Analytics Dashboard Sheet
1. Create new Google Sheet: "Market Access Analytics"
2. Set up tabs:
   - **Summary**: Key metrics and KPIs
   - **Market Analysis**: Market penetration data
   - **Progress Tracking**: Completion rates and timelines
   - **Revenue Impact**: Financial projections and actual results

### 3.2 Share Sheets with Service Account

For each sheet:
1. Click "Share" button
2. Add service account email
3. Set permission to "Editor"
4. Click "Share"

### 3.3 Get Sheet IDs

1. Open each Google Sheet
2. Copy the sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
3. Save these IDs for configuration

## Phase 4: Application Configuration

### 4.1 Environment Variables Setup

Add the following environment variables to your application:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback

# Google Service Account (JSON key content)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----
GOOGLE_PROJECT_ID=your-project-id

# Google Drive Configuration
GOOGLE_DRIVE_ROOT_FOLDER_ID=your_root_folder_id
GOOGLE_DRIVE_COMPANIES_FOLDER_ID=your_companies_folder_id
GOOGLE_DRIVE_TEMPLATES_FOLDER_ID=your_templates_folder_id

# Google Sheets Configuration
GOOGLE_SHEETS_COMPANIES_ID=your_companies_sheet_id
GOOGLE_SHEETS_LEGAL_NEEDS_ID=your_legal_needs_sheet_id
GOOGLE_SHEETS_ANALYTICS_ID=your_analytics_sheet_id

# Sync Configuration
GOOGLE_SYNC_INTERVAL_MINUTES=15
GOOGLE_BATCH_SIZE=100
```

### 4.2 Backend Integration Setup

The application includes Google API client utilities. To activate:

1. Install additional dependencies:
```bash
npm install googleapis google-auth-library
```

2. Configure the Google API service in your backend
3. Set up automatic sync webhooks
4. Configure real-time change detection

## Phase 5: User Authentication Flow

### 5.1 OAuth 2.0 Setup

1. Users click "Connect Google Account" in the application
2. They're redirected to Google's OAuth consent screen
3. After authorization, Google redirects back with an authorization code
4. Your application exchanges this code for access/refresh tokens
5. Store tokens securely in the database (encrypted)

### 5.2 Token Management

- Access tokens expire after 1 hour
- Refresh tokens are used to get new access tokens
- Implement automatic token refresh before expiration
- Handle revocation gracefully

## Phase 6: Data Synchronization

### 6.1 Real-time Sync Configuration

#### 6.1.1 Company Data Sync
- **Frequency**: Every 15 minutes or on-demand
- **Direction**: Bi-directional
- **Conflict Resolution**: Last write wins with timestamp comparison
- **Batch Size**: 100 records per sync

#### 6.1.2 Document Sync
- **Trigger**: On document upload/modification
- **Method**: Webhook notifications from Google Drive
- **Metadata**: Sync file metadata to database
- **Storage**: Keep files in Google Drive, references in database

#### 6.1.3 Legal Needs Sync
- **Frequency**: Real-time for critical updates, batch for bulk changes
- **Validation**: Ensure data integrity before sync
- **Audit Trail**: Log all changes with timestamps and user attribution

### 6.2 Webhook Configuration

1. Set up webhook endpoints in your application:
   ```
   POST /webhooks/google/drive
   POST /webhooks/google/sheets
   ```

2. Configure Google Drive API push notifications:
   - Endpoint: `https://your-domain.com/webhooks/google/drive`
   - Resource: Your root folder
   - Events: File creation, modification, deletion

3. For Google Sheets, implement polling with change detection

## Phase 7: Security & Compliance

### 7.1 Data Encryption

- Encrypt all stored tokens using AES-256
- Use environment variables for sensitive configuration
- Implement secure key rotation policies

### 7.2 Access Controls

- Implement role-based access to Google resources
- Audit all Google API calls
- Set up monitoring for unusual activity

### 7.3 Backup Strategy

- Daily backups of Google Sheets data
- Periodic exports of Google Drive folder structure
- Maintain local copies of critical documents

## Phase 8: Monitoring & Maintenance

### 8.1 Health Checks

Monitor:
- Google API quota usage
- Sync success/failure rates
- Token expiration status
- Webhook delivery success

### 8.2 Error Handling

- Implement exponential backoff for API failures
- Set up alerts for sync failures
- Provide manual re-sync capabilities

### 8.3 Performance Optimization

- Use batch operations where possible
- Implement caching for frequently accessed data
- Monitor and optimize API call patterns

## Phase 9: Testing & Validation

### 9.1 Integration Testing

1. **Authentication Flow**:
   - Test OAuth login/logout
   - Verify token refresh
   - Test permission scopes

2. **Data Synchronization**:
   - Create test company → verify in Google Sheets
   - Upload document → verify in Google Drive
   - Modify data in Google Sheets → verify in application

3. **Error Scenarios**:
   - Test quota exceeded handling
   - Test network connectivity issues
   - Test invalid token scenarios

### 9.2 User Acceptance Testing

1. Train end users on Google integration features
2. Conduct workflow testing with real data
3. Gather feedback on sync performance and reliability

## Phase 10: Go-Live Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] Service account permissions verified
- [ ] OAuth consent screen approved (if external)
- [ ] Webhook endpoints tested
- [ ] Backup procedures tested
- [ ] Monitoring dashboards configured

### Launch Day
- [ ] Monitor sync performance
- [ ] Watch for authentication issues
- [ ] Track API quota usage
- [ ] Validate data integrity
- [ ] Collect user feedback

### Post-Launch
- [ ] Review sync logs for optimization opportunities
- [ ] Update documentation based on user feedback
- [ ] Plan for scaling (additional API quotas, etc.)

## Troubleshooting Guide

### Common Issues

1. **"Access Denied" Errors**:
   - Verify service account has correct permissions
   - Check folder sharing settings
   - Validate API scopes

2. **Sync Failures**:
   - Check API quota limits
   - Verify network connectivity
   - Review error logs for specific issues

3. **Token Expiration**:
   - Implement automatic refresh
   - Check refresh token validity
   - Re-authenticate if refresh fails

4. **Webhook Delivery Issues**:
   - Verify endpoint URL accessibility
   - Check SSL certificate validity
   - Review webhook configuration

### Support Contacts

- **Google Cloud Support**: Available through your console
- **Google Workspace Support**: For organizational account issues
- **Application Support**: Contact your development team

## Additional Resources

- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

This integration will provide seamless synchronization between your Market Access Management System and Google services, ensuring data consistency and enabling powerful collaborative workflows.