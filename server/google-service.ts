import { google } from 'googleapis';
import { storage } from './storage';
import type { Company, LegalNeed, User } from '@shared/schema';

export class GoogleIntegrationService {
  private auth: any;
  private drive: any;
  private sheets: any;

  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
      },
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Initialize Google Drive folder structure for the system
   */
  async initializeDriveStructure(): Promise<{
    rootFolderId: string;
    companiesFolderId: string;
    templatesFolderId: string;
  }> {
    try {
      // Create root folder
      const rootFolder = await this.drive.files.create({
        requestBody: {
          name: 'Market Access Management System',
          mimeType: 'application/vnd.google-apps.folder',
        },
      });

      // Create subfolders
      const companiesFolder = await this.drive.files.create({
        requestBody: {
          name: 'Companies',
          mimeType: 'application/vnd.google-apps.folder',
          parents: [rootFolder.data.id],
        },
      });

      const templatesFolder = await this.drive.files.create({
        requestBody: {
          name: 'Templates',
          mimeType: 'application/vnd.google-apps.folder',
          parents: [rootFolder.data.id],
        },
      });

      return {
        rootFolderId: rootFolder.data.id!,
        companiesFolderId: companiesFolder.data.id!,
        templatesFolderId: templatesFolder.data.id!,
      };
    } catch (error) {
      console.error('Failed to initialize Drive structure:', error);
      throw new Error('Failed to initialize Google Drive structure');
    }
  }

  /**
   * Create a dedicated folder for a company
   */
  async createCompanyFolder(companyName: string, parentFolderId: string): Promise<string> {
    try {
      const folder = await this.drive.files.create({
        requestBody: {
          name: `${companyName} - Documents`,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId],
        },
      });
      return folder.data.id!;
    } catch (error) {
      console.error(`Failed to create folder for ${companyName}:`, error);
      throw new Error(`Failed to create company folder for ${companyName}`);
    }
  }

  /**
   * Create the main tracking spreadsheet
   */
  async createTrackingSpreadsheet(): Promise<string> {
    try {
      const spreadsheet = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'Market Access Management - Master Tracking',
          },
          sheets: [
            {
              properties: {
                title: 'Companies',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 20,
                },
              },
            },
            {
              properties: {
                title: 'Legal Needs',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 25,
                },
              },
            },
            {
              properties: {
                title: 'Tasks',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 20,
                },
              },
            },
            {
              properties: {
                title: 'Analytics',
                gridProperties: {
                  rowCount: 100,
                  columnCount: 15,
                },
              },
            },
          ],
        },
      });

      const spreadsheetId = spreadsheet.data.spreadsheetId!;
      
      // Set up headers for each sheet
      await this.setupSpreadsheetHeaders(spreadsheetId);
      
      return spreadsheetId;
    } catch (error) {
      console.error('Failed to create tracking spreadsheet:', error);
      throw new Error('Failed to create tracking spreadsheet');
    }
  }

  /**
   * Set up headers for the tracking spreadsheet
   */
  private async setupSpreadsheetHeaders(spreadsheetId: string): Promise<void> {
    const companiesHeaders = [
      'ID', 'Name', 'Sector', 'Description', 'Team Size', 'Founded Year',
      'Website', 'Primary Contact', 'Email', 'Phone', 'Current Markets',
      'Target Markets', 'Registration Status', 'Created Date', 'Last Updated'
    ];

    const legalNeedsHeaders = [
      'ID', 'Company ID', 'Company Name', 'Category', 'Title', 'Description',
      'Priority', 'Status', 'Country', 'Timeline', 'Assigned To', 'Budget Range',
      'Requirements', 'Progress', 'Created Date', 'Updated Date', 'Due Date'
    ];

    const tasksHeaders = [
      'ID', 'Title', 'Description', 'Type', 'Status', 'Priority', 'Assignee',
      'Company', 'Legal Need', 'Due Date', 'Progress', 'Tags', 'Created Date',
      'Updated Date', 'Completed Date'
    ];

    const requests = [
      {
        updateCells: {
          range: {
            sheetId: 0, // Companies sheet
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: companiesHeaders.length,
          },
          rows: [{
            values: companiesHeaders.map(header => ({
              userEnteredValue: { stringValue: header },
              userEnteredFormat: { textFormat: { bold: true } }
            }))
          }],
          fields: 'userEnteredValue,userEnteredFormat.textFormat.bold',
        },
      },
      {
        updateCells: {
          range: {
            sheetId: 1, // Legal Needs sheet
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: legalNeedsHeaders.length,
          },
          rows: [{
            values: legalNeedsHeaders.map(header => ({
              userEnteredValue: { stringValue: header },
              userEnteredFormat: { textFormat: { bold: true } }
            }))
          }],
          fields: 'userEnteredValue,userEnteredFormat.textFormat.bold',
        },
      },
      {
        updateCells: {
          range: {
            sheetId: 2, // Tasks sheet
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: tasksHeaders.length,
          },
          rows: [{
            values: tasksHeaders.map(header => ({
              userEnteredValue: { stringValue: header },
              userEnteredFormat: { textFormat: { bold: true } }
            }))
          }],
          fields: 'userEnteredValue,userEnteredFormat.textFormat.bold',
        },
      },
    ];

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });
  }

  /**
   * Sync companies data to Google Sheets
   */
  async syncCompaniesToSheets(spreadsheetId: string): Promise<void> {
    try {
      const companies = await storage.getCompanies();
      
      if (companies.length === 0) {
        console.log('No companies to sync');
        return;
      }

      // Clear existing data (keep headers)
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: 'Companies!A2:Z',
      });

      // Prepare data rows
      const values = companies.map(company => [
        company.id,
        company.name,
        company.sector,
        company.description || '',
        company.teamSize || '',
        company.foundedYear?.toString() || '',
        company.website || '',
        company.primaryContactName,
        company.primaryContactEmail,
        company.primaryContactPhone || '',
        JSON.stringify(company.currentMarkets),
        JSON.stringify(company.targetMarkets),
        JSON.stringify(company.registrations),
        company.createdAt?.toISOString() || '',
        company.updatedAt?.toISOString() || '',
      ]);

      // Update the sheet
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Companies!A2',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });

      console.log(`Synced ${companies.length} companies to Google Sheets`);
    } catch (error) {
      console.error('Failed to sync companies to sheets:', error);
      throw new Error('Failed to sync companies data');
    }
  }

  /**
   * Sync legal needs data to Google Sheets
   */
  async syncLegalNeedsToSheets(spreadsheetId: string): Promise<void> {
    try {
      const legalNeeds = await storage.getLegalNeeds();
      
      if (legalNeeds.length === 0) {
        console.log('No legal needs to sync');
        return;
      }

      // Clear existing data (keep headers)
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: 'Legal Needs!A2:Z',
      });

      // Get company names for reference
      const companies = await storage.getCompanies();
      const companyMap = new Map(companies.map(c => [c.id, c.name]));

      // Prepare data rows
      const values = legalNeeds.map(need => [
        need.id,
        need.companyId,
        companyMap.get(need.companyId) || 'Unknown',
        need.category,
        need.title,
        need.description || '',
        need.priority,
        need.status,
        '', // country - not in schema
        '', // timeline - not in schema 
        need.assignedTo || '',
        '', // budgetRange - not in schema
        JSON.stringify(need.statusUpdates || {}),
        need.progress?.toString() || '0',
        need.createdAt?.toISOString() || '',
        need.updatedAt?.toISOString() || '',
        need.completedAt?.toISOString() || '',
      ]);

      // Update the sheet
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Legal Needs!A2',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });

      console.log(`Synced ${legalNeeds.length} legal needs to Google Sheets`);
    } catch (error) {
      console.error('Failed to sync legal needs to sheets:', error);
      throw new Error('Failed to sync legal needs data');
    }
  }

  /**
   * Perform full data synchronization
   */
  async performFullSync(spreadsheetId: string): Promise<void> {
    console.log('Starting full data synchronization...');
    
    try {
      await Promise.all([
        this.syncCompaniesToSheets(spreadsheetId),
        this.syncLegalNeedsToSheets(spreadsheetId),
      ]);
      
      console.log('Full data synchronization completed successfully');
    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
  }

  /**
   * Upload a document to a company's folder
   */
  async uploadDocument(
    companyFolderId: string,
    fileName: string,
    fileContent: Buffer,
    mimeType: string
  ): Promise<string> {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: [companyFolderId],
        },
        media: {
          mimeType,
          body: fileContent,
        },
      });

      return response.data.id!;
    } catch (error) {
      console.error(`Failed to upload document ${fileName}:`, error);
      throw new Error(`Failed to upload document: ${fileName}`);
    }
  }
}

export const googleService = new GoogleIntegrationService();