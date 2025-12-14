-- Create missing tables for StudyBuddy database
-- This script creates the AuditLogs and UserActivities tables that are referenced in the application but missing from the database

-- Create AuditLogs table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AuditLogs' AND xtype='U')
BEGIN
    CREATE TABLE [AuditLogs] (
        [AuditLogId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [UserId] INT NOT NULL,
        [ActionType] NVARCHAR(100) NOT NULL,
        [EntityType] NVARCHAR(100) NULL,
        [EntityId] INT NULL,
        [OldValues] NVARCHAR(MAX) NULL,
        [NewValues] NVARCHAR(MAX) NULL,
        [CreatedAt] DATETIME2 NOT NULL,
        CONSTRAINT [FK_AuditLogs_Users_UserId] FOREIGN KEY ([UserId]) 
            REFERENCES [Users] ([UserId]) 
            ON DELETE NO ACTION ON UPDATE NO ACTION
    );
    
    CREATE INDEX [IX_AuditLogs_UserId] ON [AuditLogs] ([UserId]);
END
GO

-- Create UserActivities table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserActivities' AND xtype='U')
BEGIN
    CREATE TABLE [UserActivities] (
        [ActivityId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [UserId] INT NOT NULL,
        [ActivityType] NVARCHAR(100) NULL,
        [EntityType] NVARCHAR(50) NULL,
        [EntityId] INT NULL,
        [CreatedAt] DATETIME2 NOT NULL,
        CONSTRAINT [FK_UserActivities_Users_UserId] FOREIGN KEY ([UserId]) 
            REFERENCES [Users] ([UserId]) 
            ON DELETE NO ACTION ON UPDATE NO ACTION
    );
    
    CREATE INDEX [IX_UserActivities_UserId] ON [UserActivities] ([UserId]);
END
GO

-- Update decimal columns to have proper precision for existing tables
-- This will resolve the Entity Framework warnings about decimal precision

-- Update AnalyticsSnapshots.AverageCompletionRate
IF EXISTS (SELECT * FROM sysobjects WHERE name='AnalyticsSnapshots' AND xtype='U')
BEGIN
    ALTER TABLE [AnalyticsSnapshots] 
    ALTER COLUMN [AverageCompletionRate] DECIMAL(5,2);
END
GO

-- Update Courses.AverageRating
IF EXISTS (SELECT * FROM sysobjects WHERE name='Courses' AND xtype='U')
BEGIN
    ALTER TABLE [Courses] 
    ALTER COLUMN [AverageRating] DECIMAL(3,2);
END
GO

-- Update Courses.DurationHours
IF EXISTS (SELECT * FROM sysobjects WHERE name='Courses' AND xtype='U')
BEGIN
    ALTER TABLE [Courses] 
    ALTER COLUMN [DurationHours] DECIMAL(6,2);
END
GO

-- Update Enrollments.ProgressPercentage
IF EXISTS (SELECT * FROM sysobjects WHERE name='Enrollments' AND xtype='U')
BEGIN
    ALTER TABLE [Enrollments] 
    ALTER COLUMN [ProgressPercentage] DECIMAL(5,2);
END
GO

PRINT 'Missing tables created successfully and decimal precision updated.';