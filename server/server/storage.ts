import { type PlateRecord, type InsertPlateRecord } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Plate Records
  getPlateRecord(id: string): Promise<PlateRecord | undefined>;
  getAllPlateRecords(): Promise<PlateRecord[]>;
  getRecentPlateRecords(limit?: number): Promise<PlateRecord[]>;
  getTodayPlateRecords(): Promise<PlateRecord[]>;
  createPlateRecord(record: InsertPlateRecord): Promise<PlateRecord>;
  deletePlateRecord(id: string): Promise<boolean>;
  
  // Statistics
  getPlateRecordStats(): Promise<{
    total: number;
    today: number;
    successRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private plateRecords: Map<string, PlateRecord>;

  constructor() {
    this.plateRecords = new Map();
  }

  async getPlateRecord(id: string): Promise<PlateRecord | undefined> {
    return this.plateRecords.get(id);
  }

  async getAllPlateRecords(): Promise<PlateRecord[]> {
    return Array.from(this.plateRecords.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getRecentPlateRecords(limit: number = 10): Promise<PlateRecord[]> {
    const records = await this.getAllPlateRecords();
    return records.slice(0, limit);
  }

  async getTodayPlateRecords(): Promise<PlateRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.plateRecords.values())
      .filter(record => new Date(record.timestamp) >= today);
  }

  async createPlateRecord(insertRecord: InsertPlateRecord): Promise<PlateRecord> {
    const id = randomUUID();
    const record: PlateRecord = { 
      ...insertRecord, 
      id, 
      timestamp: new Date() 
    };
    this.plateRecords.set(id, record);
    return record;
  }

  async deletePlateRecord(id: string): Promise<boolean> {
    return this.plateRecords.delete(id);
  }

  async getPlateRecordStats(): Promise<{
    total: number;
    today: number;
    successRate: number;
  }> {
    const allRecords = Array.from(this.plateRecords.values());
    const todayRecords = await this.getTodayPlateRecords();
    const successfulRecords = allRecords.filter(record => record.processed === 1);
    
    return {
      total: allRecords.length,
      today: todayRecords.length,
      successRate: allRecords.length > 0 ? Math.round((successfulRecords.length / allRecords.length) * 100) : 0
    };
  }
}

export const storage = new MemStorage();
