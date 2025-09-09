// Google API integration utilities
// This module provides utilities for integrating with Google Drive and Google Sheets APIs

export interface GoogleCredentials {
  accessToken: string;
  refreshToken: string;
  expiryDate: Date;
  scope: string[];
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  parents?: string[];
}

export interface GoogleDriveFolderStructure {
  id: string;
  name: string;
  parentId?: string;
}

export interface GoogleSheetsData {
  spreadsheetId: string;
  range: string;
  values: any[][];
}

export class GoogleAPIClient {
  private accessToken: string;
  private baseUrl = 'https://www.googleapis.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Google API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Google Drive API methods
  async createFolder(name: string, parentId?: string): Promise<GoogleDriveFile> {
    const metadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId && { parents: [parentId] }),
    };

    return this.makeRequest(`${this.baseUrl}/drive/v3/files`, {
      method: 'POST',
      body: JSON.stringify(metadata),
    });
  }

  async listFiles(folderId?: string, pageSize = 100): Promise<{ files: GoogleDriveFile[] }> {
    const query = folderId ? `'${folderId}' in parents` : undefined;
    const params = new URLSearchParams({
      pageSize: pageSize.toString(),
      fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,parents)',
      ...(query && { q: query }),
    });

    return this.makeRequest(`${this.baseUrl}/drive/v3/files?${params}`);
  }

  async uploadFile(
    name: string,
    content: Blob | string,
    mimeType: string,
    parentId?: string
  ): Promise<GoogleDriveFile> {
    const metadata = {
      name,
      ...(parentId && { parents: [parentId] }),
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', content instanceof Blob ? content : new Blob([content], { type: mimeType }));

    const response = await fetch(`${this.baseUrl}/upload/drive/v3/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: form,
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async shareFile(fileId: string, email: string, role: 'reader' | 'writer' | 'owner' = 'reader') {
    return this.makeRequest(`${this.baseUrl}/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({
        role,
        type: 'user',
        emailAddress: email,
      }),
    });
  }

  // Google Sheets API methods
  async createSpreadsheet(title: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    const response = await this.makeRequest(`${this.baseUrl}/sheets/v4/spreadsheets`, {
      method: 'POST',
      body: JSON.stringify({
        properties: { title },
      }),
    });

    return {
      spreadsheetId: response.spreadsheetId,
      spreadsheetUrl: response.spreadsheetUrl,
    };
  }

  async readSheet(spreadsheetId: string, range: string): Promise<GoogleSheetsData> {
    const response = await this.makeRequest(
      `${this.baseUrl}/sheets/v4/spreadsheets/${spreadsheetId}/values/${range}`
    );

    return {
      spreadsheetId,
      range: response.range,
      values: response.values || [],
    };
  }

  async writeSheet(
    spreadsheetId: string,
    range: string,
    values: any[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ) {
    return this.makeRequest(
      `${this.baseUrl}/sheets/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=${valueInputOption}`,
      {
        method: 'PUT',
        body: JSON.stringify({ values }),
      }
    );
  }

  async appendSheet(
    spreadsheetId: string,
    range: string,
    values: any[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ) {
    return this.makeRequest(
      `${this.baseUrl}/sheets/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=${valueInputOption}`,
      {
        method: 'POST',
        body: JSON.stringify({ values }),
      }
    );
  }

  async batchUpdateSheet(spreadsheetId: string, requests: any[]) {
    return this.makeRequest(`${this.baseUrl}/sheets/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({ requests }),
    });
  }
}

// Helper functions for common operations
export async function setupCompanyFolder(
  apiClient: GoogleAPIClient,
  companyName: string,
  rootFolderId?: string
): Promise<GoogleDriveFile> {
  // Create main company folder
  const companyFolder = await apiClient.createFolder(companyName, rootFolderId);
  
  // Create subfolders for organization
  const subfolders = [
    'Legal Documents',
    'Contracts',
    'Registration Files',
    'IP Documents',
    'Reports'
  ];

  await Promise.all(
    subfolders.map(subfolder => 
      apiClient.createFolder(subfolder, companyFolder.id)
    )
  );

  return companyFolder;
}

export async function syncCompanyToSheet(
  apiClient: GoogleAPIClient,
  spreadsheetId: string,
  company: any
) {
  const values = [[
    company.id,
    company.name,
    company.sector,
    company.teamSize,
    Array.isArray(company.currentMarkets) ? company.currentMarkets.join(', ') : '',
    Array.isArray(company.targetMarkets) ? company.targetMarkets.join(', ') : '',
    company.primaryContactName,
    company.primaryContactEmail,
    'Active', // Status
    new Date().toISOString()
  ]];

  return apiClient.appendSheet(spreadsheetId, 'Companies!A:J', values);
}

export async function syncLegalNeedToSheet(
  apiClient: GoogleAPIClient,
  spreadsheetId: string,
  legalNeed: any,
  companyName: string
) {
  const values = [[
    legalNeed.id,
    companyName,
    legalNeed.category.replace('_', ' '),
    legalNeed.title,
    legalNeed.priority,
    legalNeed.status,
    legalNeed.assignedTo || '',
    legalNeed.expectedCompletionDate || '',
    `${legalNeed.progress || 0}%`,
    legalNeed.description || ''
  ]];

  return apiClient.appendSheet(spreadsheetId, 'Legal Needs!A:J', values);
}

// OAuth2 flow helpers
export function generateGoogleOAuthUrl(
  clientId: string,
  redirectUri: string,
  scopes: string[] = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
  ]
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<GoogleCredentials> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiryDate: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope.split(' '),
  };
}

export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ accessToken: string; expiryDate: Date }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    expiryDate: new Date(Date.now() + data.expires_in * 1000),
  };
}
