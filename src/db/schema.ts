import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const interviews = pgTable('interviews', {
  id: serial('id').primaryKey(),
  candidateId: text('candidate_id').notNull(),
  recruiterUid: text('recruiter_uid').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const candidateNotes = pgTable('candidate_notes', {
  id: serial('id').primaryKey(),
  candidateId: text('candidate_id').notNull(),
  recruiterUid: text('recruiter_uid').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const emailTemplates = pgTable('email_templates', {
  id: serial('id').primaryKey(),
  recruiterUid: text('recruiter_uid').notNull(),
  type: text('type').notNull(), // 'interview_scheduling' or 'rejection_notice'
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
