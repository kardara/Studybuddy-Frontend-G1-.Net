-- Comprehensive Database Fix Script for StudyBuddy
-- This script fixes all identified database schema issues

-- 1. Create missing StudentProgresses table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StudentProgresses' AND xtype='U')
BEGIN
    CREATE TABLE [StudentProgresses] (
        [ProgressId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [StudentId] INT NOT NULL,
        [CourseId] INT NOT NULL,
        [LessonId] INT NULL,
        [IsCompleted] BIT NOT NULL DEFAULT 0,
        [ProgressPercentage] DECIMAL(5,2) NOT NULL DEFAULT 0,
        [LastAccessedAt] DATETIME2 NULL,
        [CompletedAt] DATETIME2 NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [FK_StudentProgresses_Users_StudentId] FOREIGN KEY ([StudentId]) 
            REFERENCES [Users] ([UserId]) 
            ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT [FK_StudentProgresses_Courses_CourseId] FOREIGN KEY ([CourseId]) 
            REFERENCES [Courses] ([CourseId]) 
            ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT [FK_StudentProgresses_Lessons_LessonId] FOREIGN KEY ([LessonId]) 
            REFERENCES [Lessons] ([LessonId]) 
            ON DELETE NO ACTION ON UPDATE NO ACTION
    );
    
    CREATE INDEX [IX_StudentProgresses_StudentId] ON [StudentProgresses] ([StudentId]);
    CREATE INDEX [IX_StudentProgresses_CourseId] ON [StudentProgresses] ([CourseId]);
    CREATE INDEX [IX_StudentProgresses_LessonId] ON [StudentProgresses] ([LessonId]);
    CREATE INDEX [IX_StudentProgresses_StudentId_CourseId] ON [StudentProgresses] ([StudentId], [CourseId]);
    CREATE INDEX [IX_StudentProgresses_StudentId_LessonId] ON [StudentProgresses] ([StudentId], [LessonId]);
END
GO

-- 2. Add missing Difficulty column to Questions table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Questions]') AND name = 'Difficulty')
BEGIN
    ALTER TABLE [Questions] 
    ADD [Difficulty] NVARCHAR(20) NULL;
    
    -- Update existing records with default difficulty
    UPDATE [Questions] SET [Difficulty] = 'Medium' WHERE [Difficulty] IS NULL;
END
GO

-- 3. Create missing AuditLogs table
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
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [FK_AuditLogs_Users_UserId] FOREIGN KEY ([UserId]) 
            REFERENCES [Users] ([UserId]) 
            ON DELETE NO ACTION ON UPDATE NO ACTION
    );
    
    CREATE INDEX [IX_AuditLogs_UserId] ON [AuditLogs] ([UserId]);
    CREATE INDEX [IX_AuditLogs_CreatedAt] ON [AuditLogs] ([CreatedAt]);
END
GO

-- 4. Create missing UserActivities table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserActivities' AND xtype='U')
BEGIN
    CREATE TABLE [UserActivities] (
        [ActivityId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [UserId] INT NOT NULL,
        [ActivityType] NVARCHAR(100) NULL,
        [EntityType] NVARCHAR(50) NULL,
        [EntityId] INT NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [FK_UserActivities_Users_UserId] FOREIGN KEY ([UserId]) 
            REFERENCES [Users] ([UserId]) 
            ON DELETE NO ACTION ON UPDATE NO ACTION
    );
    
    CREATE INDEX [IX_UserActivities_UserId] ON [UserActivities] ([UserId]);
    CREATE INDEX [IX_UserActivities_CreatedAt] ON [UserActivities] ([CreatedAt]);
END
GO

-- 5. Create missing Permissions table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Permissions' AND xtype='U')
BEGIN
    CREATE TABLE [Permissions] (
        [PermissionId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [PermissionName] NVARCHAR(100) NOT NULL UNIQUE,
        [Description] NVARCHAR(255) NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    -- Insert default permissions
    INSERT INTO [Permissions] ([PermissionName], [Description]) VALUES
    ('CreateCourse', 'Permission to create new courses'),
    ('EditCourse', 'Permission to edit existing courses'),
    ('DeleteCourse', 'Permission to delete courses'),
    ('ManageUsers', 'Permission to manage users'),
    ('ViewAnalytics', 'Permission to view analytics'),
    ('ManageRoles', 'Permission to manage roles and permissions'),
    ('TakeQuiz', 'Permission to take quizzes'),
    ('ViewProgress', 'Permission to view student progress');
END
GO

-- 6. Create missing RolePermissions table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RolePermissions' AND xtype='U')
BEGIN
    CREATE TABLE [RolePermissions] (
        [RolePermissionId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Role] NVARCHAR(50) NOT NULL,
        [PermissionId] INT NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [FK_RolePermissions_Permissions_PermissionId] FOREIGN KEY ([PermissionId]) 
            REFERENCES [Permissions] ([PermissionId]) 
            ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT [UQ_RolePermissions_Role_PermissionId] UNIQUE ([Role], [PermissionId])
    );
    
    CREATE INDEX [IX_RolePermissions_Role] ON [RolePermissions] ([Role]);
    CREATE INDEX [IX_RolePermissions_PermissionId] ON [RolePermissions] ([PermissionId]);
    
    -- Insert default role permissions
    INSERT INTO [RolePermissions] ([Role], [PermissionId]) 
    SELECT 'Admin', [PermissionId] FROM [Permissions];
    
    INSERT INTO [RolePermissions] ([Role], [PermissionId]) 
    SELECT 'Instructor', [PermissionId] FROM [Permissions] 
    WHERE [PermissionName] IN ('CreateCourse', 'EditCourse', 'ViewAnalytics', 'ViewProgress');
    
    INSERT INTO [RolePermissions] ([Role], [PermissionId]) 
    SELECT 'Student', [PermissionId] FROM [Permissions] 
    WHERE [PermissionName] IN ('TakeQuiz', 'ViewProgress');
END
GO

-- 7. Update decimal columns to have proper precision for existing tables
IF EXISTS (SELECT * FROM sysobjects WHERE name='AnalyticsSnapshots' AND xtype='U')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[AnalyticsSnapshots]') AND name = 'AverageCompletionRate')
        ALTER TABLE [AnalyticsSnapshots] ALTER COLUMN [AverageCompletionRate] DECIMAL(5,2);
END
GO

IF EXISTS (SELECT * FROM sysobjects WHERE name='Courses' AND xtype='U')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Courses]') AND name = 'AverageRating')
        ALTER TABLE [Courses] ALTER COLUMN [AverageRating] DECIMAL(3,2);
    
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Courses]') AND name = 'DurationHours')
        ALTER TABLE [Courses] ALTER COLUMN [DurationHours] DECIMAL(6,2);
END
GO

IF EXISTS (SELECT * FROM sysobjects WHERE name='Enrollments' AND xtype='U')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Enrollments]') AND name = 'ProgressPercentage')
        ALTER TABLE [Enrollments] ALTER COLUMN [ProgressPercentage] DECIMAL(5,2);
END
GO

-- 8. Create missing ChatSessions table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChatSessions' AND xtype='U')
BEGIN
    CREATE TABLE [ChatSessions] (
        [SessionId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [UserId] INT NOT NULL,
        [Title] NVARCHAR(255) NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [FK_ChatSessions_Users_UserId] FOREIGN KEY ([UserId]) 
            REFERENCES [Users] ([UserId]) 
            ON DELETE CASCADE ON UPDATE CASCADE
    );
    
    CREATE INDEX [IX_ChatSessions_UserId] ON [ChatSessions] ([UserId]);
END
GO

-- 9. Create missing ChatMessages table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChatMessages' AND xtype='U')
BEGIN
    CREATE TABLE [ChatMessages] (
        [MessageId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [SessionId] INT NOT NULL,
        [MessageText] NVARCHAR(MAX) NOT NULL,
        [IsFromUser] BIT NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [FK_ChatMessages_ChatSessions_SessionId] FOREIGN KEY ([SessionId]) 
            REFERENCES [ChatSessions] ([SessionId]) 
            ON DELETE CASCADE ON UPDATE CASCADE
    );
    
    CREATE INDEX [IX_ChatMessages_SessionId] ON [ChatMessages] ([SessionId]);
    CREATE INDEX [IX_ChatMessages_CreatedAt] ON [ChatMessages] ([CreatedAt]);
END
GO

PRINT 'Database schema fixes applied successfully!';
PRINT 'Created/Updated tables: StudentProgresses, Questions (Difficulty column), AuditLogs, UserActivities, Permissions, RolePermissions, ChatSessions, ChatMessages';
PRINT 'Updated decimal precision for: AnalyticsSnapshots, Courses, Enrollments';