-- Fix database issues for StudyBuddy
-- Run this script on the online database at db33783.public.databaseasp.net

-- 1. Add missing Difficulty column to Questions table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Questions') AND name = 'Difficulty')
BEGIN
    ALTER TABLE [Questions] ADD [Difficulty] NVARCHAR(20) NULL;
    PRINT 'Added Difficulty column to Questions table';
END
ELSE
BEGIN
    PRINT 'Difficulty column already exists';
END
GO

-- 2. Create missing AnalyticsSnapshots table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AnalyticsSnapshots' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[AnalyticsSnapshots](
        [SnapshotId] [int] IDENTITY(1,1) NOT NULL,
        [SnapshotDate] [datetime2] NOT NULL,
        [TotalActiveUsers] [int] NULL,
        [TotalCoursesEnrolled] [int] NULL,
        [TotalLessonsCompleted] [int] NULL,
        [TotalQuizzesSubmitted] [int] NULL,
        [AverageCompletionRate] [decimal](5, 2) NULL,
        [CreatedAt] [datetime2] NOT NULL,
     CONSTRAINT [PK_AnalyticsSnapshots] PRIMARY KEY CLUSTERED
    (
        [SnapshotId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY];

    CREATE UNIQUE NONCLUSTERED INDEX [IX_AnalyticsSnapshots_SnapshotDate] ON [dbo].[AnalyticsSnapshots]
    (
        [SnapshotDate] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY];

    ALTER TABLE [dbo].[AnalyticsSnapshots] ADD  DEFAULT (getdate()) FOR [CreatedAt];

    PRINT 'Created AnalyticsSnapshots table';
END
ELSE
BEGIN
    PRINT 'AnalyticsSnapshots table already exists';
END
GO

-- 3. Create missing CertificateTemplates table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CertificateTemplates' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[CertificateTemplates](
        [TemplateId] [int] IDENTITY(1,1) NOT NULL,
        [TemplateName] [nvarchar](300) NOT NULL,
        [TemplateHtml] [nvarchar](max) NULL,
        [LogoUrl] [nvarchar](max) NULL,
        [CreatedAt] [datetime2] NOT NULL,
        [UpdatedAt] [datetime2] NOT NULL,
     CONSTRAINT [PK_CertificateTemplates] PRIMARY KEY CLUSTERED
    (
        [TemplateId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];

    ALTER TABLE [dbo].[CertificateTemplates] ADD  DEFAULT (getdate()) FOR [CreatedAt];
    ALTER TABLE [dbo].[CertificateTemplates] ADD  DEFAULT (getdate()) FOR [UpdatedAt];

    PRINT 'Created CertificateTemplates table';
END
ELSE
BEGIN
    PRINT 'CertificateTemplates table already exists';
END
GO

-- 4. Create missing ChatSessions table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChatSessions' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[ChatSessions](
        [SessionId] [int] IDENTITY(1,1) NOT NULL,
        [StudentId] [int] NOT NULL,
        [CourseId] [int] NULL,
        [StartedAt] [datetime2] NOT NULL,
        [EndedAt] [datetime2] NULL,
        [Status] [nvarchar](20) NOT NULL,
        [TotalMessages] [int] NOT NULL,
     CONSTRAINT [PK_ChatSessions] PRIMARY KEY CLUSTERED
    (
        [SessionId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY];

    ALTER TABLE [dbo].[ChatSessions] ADD  DEFAULT (getdate()) FOR [StartedAt];
    ALTER TABLE [dbo].[ChatSessions] ADD  DEFAULT ((0)) FOR [TotalMessages];

    CREATE NONCLUSTERED INDEX [IX_ChatSessions_CourseId] ON [dbo].[ChatSessions]
    (
        [CourseId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY];

    CREATE NONCLUSTERED INDEX [IX_ChatSessions_StudentId] ON [dbo].[ChatSessions]
    (
        [StudentId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY];

    ALTER TABLE [dbo].[ChatSessions]  WITH CHECK ADD  CONSTRAINT [FK_ChatSessions_Courses_CourseId] FOREIGN KEY([CourseId])
    REFERENCES [dbo].[Courses] ([CourseId]);
    ALTER TABLE [dbo].[ChatSessions] CHECK CONSTRAINT [FK_ChatSessions_Courses_CourseId];

    ALTER TABLE [dbo].[ChatSessions]  WITH CHECK ADD  CONSTRAINT [FK_ChatSessions_Users_StudentId] FOREIGN KEY([StudentId])
    REFERENCES [dbo].[Users] ([UserId]);
    ALTER TABLE [dbo].[ChatSessions] CHECK CONSTRAINT [FK_ChatSessions_Users_StudentId];

    PRINT 'Created ChatSessions table';
END
ELSE
BEGIN
    PRINT 'ChatSessions table already exists';
END
GO

-- 5. Create missing ChatMessages table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChatMessages' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[ChatMessages](
        [MessageId] [int] IDENTITY(1,1) NOT NULL,
        [SessionId] [int] NOT NULL,
        [SenderType] [nvarchar](20) NULL,
        [SenderUserId] [int] NULL,
        [MessageText] [nvarchar](max) NOT NULL,
        [MessageType] [nvarchar](50) NULL,
        [SentAt] [datetime2] NOT NULL,
     CONSTRAINT [PK_ChatMessages] PRIMARY KEY CLUSTERED
    (
        [MessageId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];

    ALTER TABLE [dbo].[ChatMessages] ADD  DEFAULT (getdate()) FOR [SentAt];

    CREATE NONCLUSTERED INDEX [IX_ChatMessages_SenderUserId] ON [dbo].[ChatMessages]
    (
        [SenderUserId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY];

    CREATE NONCLUSTERED INDEX [IX_ChatMessages_SessionId] ON [dbo].[ChatMessages]
    (
        [SessionId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY];

    ALTER TABLE [dbo].[ChatMessages]  WITH CHECK ADD  CONSTRAINT [FK_ChatMessages_ChatSessions_SessionId] FOREIGN KEY([SessionId])
    REFERENCES [dbo].[ChatSessions] ([SessionId]);
    ALTER TABLE [dbo].[ChatMessages] CHECK CONSTRAINT [FK_ChatMessages_ChatSessions_SessionId];

    ALTER TABLE [dbo].[ChatMessages]  WITH CHECK ADD  CONSTRAINT [FK_ChatMessages_Users_SenderUserId] FOREIGN KEY([SenderUserId])
    REFERENCES [dbo].[Users] ([UserId]);
    ALTER TABLE [dbo].[ChatMessages] CHECK CONSTRAINT [FK_ChatMessages_Users_SenderUserId];

    PRINT 'Created ChatMessages table';
END
ELSE
BEGIN
    PRINT 'ChatMessages table already exists';
END
GO

-- 6. Create missing FAQTrackers table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FAQTrackers' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[FAQTrackers](
        [FAQId] [int] IDENTITY(1,1) NOT NULL,
        [Question] [nvarchar](max) NOT NULL,
        [CourseId] [int] NULL,
        [AskCount] [int] NOT NULL,
        [LastAskedAt] [datetime2] NOT NULL,
        [CategoryId] [int] NULL,
     CONSTRAINT [PK_FAQTrackers] PRIMARY KEY CLUSTERED
    (
        [FAQId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];

    ALTER TABLE [dbo].[FAQTrackers] ADD  DEFAULT ((0)) FOR [AskCount];
    ALTER TABLE [dbo].[FAQTrackers] ADD  DEFAULT (getdate()) FOR [LastAskedAt];

    CREATE NONCLUSTERED INDEX [IX_FAQTrackers_CourseId] ON [dbo].[FAQTrackers]
    (
        [CourseId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY];

    ALTER TABLE [dbo].[FAQTrackers]  WITH CHECK ADD  CONSTRAINT [FK_FAQTrackers_Courses_CourseId] FOREIGN KEY([CourseId])
    REFERENCES [dbo].[Courses] ([CourseId]);
    ALTER TABLE [dbo].[FAQTrackers] CHECK CONSTRAINT [FK_FAQTrackers_Courses_CourseId];

    PRINT 'Created FAQTrackers table';
END
ELSE
BEGIN
    PRINT 'FAQTrackers table already exists';
END
GO

-- 7. Update Lessons table to add CreatedManually column if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Lessons') AND name = 'CreatedManually')
BEGIN
    ALTER TABLE [Lessons] ADD [CreatedManually] BIT NULL;
    ALTER TABLE [dbo].[Lessons] ADD  DEFAULT ((1)) FOR [CreatedManually];
    PRINT 'Added CreatedManually column to Lessons table';
END
ELSE
BEGIN
    PRINT 'CreatedManually column already exists in Lessons table';
END
GO

-- 8. Update Modules table to add CreatedManually column if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modules') AND name = 'CreatedManually')
BEGIN
    ALTER TABLE [Modules] ADD [CreatedManually] BIT NULL;
    ALTER TABLE [dbo].[Modules] ADD  DEFAULT ((1)) FOR [CreatedManually];
    PRINT 'Added CreatedManually column to Modules table';
END
ELSE
BEGIN
    PRINT 'CreatedManually column already exists in Modules table';
END
GO

-- 9. Update Courses table to add IsManuallyCreated column if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Courses') AND name = 'IsManuallyCreated')
BEGIN
    ALTER TABLE [Courses] ADD [IsManuallyCreated] BIT NULL;
    ALTER TABLE [dbo].[Courses] ADD  DEFAULT ((1)) FOR [IsManuallyCreated];
    PRINT 'Added IsManuallyCreated column to Courses table';
END
ELSE
BEGIN
    PRINT 'IsManuallyCreated column already exists in Courses table';
END
GO

PRINT 'Database fixes completed successfully.';