import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertPlateRecordSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all plate records
  app.get("/api/records", async (_req, res) => {
    try {
      const records = await storage.getAllPlateRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch records" });
    }
  });

  // Get recent plate records
  app.get("/api/records/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const records = await storage.getRecentPlateRecords(limit);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent records" });
    }
  });

  // Get statistics
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getPlateRecordStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Create new plate record
  app.post("/api/records", async (req, res) => {
    try {
      const validatedData = insertPlateRecordSchema.parse(req.body);
      const record = await storage.createPlateRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create record" });
      }
    }
  });

  // Delete plate record
  app.delete("/api/records/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePlateRecord(id);
      if (deleted) {
        res.json({ message: "Record deleted successfully" });
      } else {
        res.status(404).json({ message: "Record not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete record" });
    }
  });

  // Export records as CSV
  app.get("/api/export", async (_req, res) => {
    try {
      const records = await storage.getAllPlateRecords();
      
      const csvHeader = "ID,Plate Number,Confidence,Timestamp,Processed,Notes\n";
      const csvRows = records.map(record => {
        return `${record.id},"${record.plateNumber}",${record.confidence},"${record.timestamp}",${record.processed},"${record.notes || ''}"`;
      }).join("\n");
      
      const csv = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="plate_records.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export records" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
