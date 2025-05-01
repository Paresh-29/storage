import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),

  // basic file/folder info
  name: text("name").notNull(),
  path: text("path").notNull(), // path to the file eg: /home/user/file.txt
  size: integer("size").notNull(),
  type: text("type").notNull(), // folder

  // storage info
  fileUrl: text("file_url").notNull(), // url to the file
  thumbnailUrl: text("thumbnail_url"),

  // owner info
  userId: text("user_id").notNull(), // user id of the owner
  parentId: uuid("parent_id").notNull(), // parent folder id nullable for root folder

  // file/folder flags
  isFolder: boolean("is_folder").notNull().default(false), // is this a folder
  isStarred: boolean("is_starred").notNull().default(false), // is this file starred
  isTrash: boolean("is_trash").notNull().default(false), // is this file in trash

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const filesRelations = relations(files, ({ one, many }) => ({
  parent: one(files, {
    fields: [files.parentId],
    references: [files.id],
  }),

  children: many(files),
}));

// Type definitions
export const File = typeof files.$inferSelect;
export const newFile = typeof files.$inferInsert;
