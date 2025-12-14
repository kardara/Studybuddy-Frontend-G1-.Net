-- ============================================================================
-- StudyBuddy - Remove AI-Related Components Script
-- ============================================================================
-- This script removes AI-related tables, data, and stored procedures
-- Run this script against your db33783 database
-- ============================================================================

USE [db33783];
GO

PRINT 'Starting removal of AI-related components...';
PRINT '';

-- ============================================================================
-- Step 1: Remove AI-related data first (due to foreign key constraints)
-- ============================================================================

-- Clear chat sessions and messages (AI chat functionality)
PRINT 'Removing AI chat data...';
DELETE FROM ChatMessages;
DELETE FROM ChatSessions;
PRINT 'AI chat data removed.';

-- Clear FAQ tracker data (likely AI-generated FAQ)
PRINT 'Removing FAQ tracker data...';
DELETE FROM FAQTracker;
PRINT 'FAQ tracker data removed.';

-- Clear analytics snapshots (if they contain AI-generated insights)
PRINT 'Removing analytics snapshots...';
DELETE FROM AnalyticsSnapshots;
PRINT 'Analytics snapshots removed.';

-- ============================================================================
-- Step 2: Remove AI-related tables
-- ============================================================================

PRINT '';
PRINT 'Removing AI-related tables...';

-- Drop AI chat tables
IF OBJECT_ID('dbo.ChatMessages', 'U') IS NOT NULL
    DROP TABLE dbo.ChatMessages;
PRINT '- Removed ChatMessages table';

IF OBJECT_ID('dbo.ChatSessions', 'U') IS NOT NULL
    DROP TABLE dbo.ChatSessions;
PRINT '- Removed ChatSessions table';

-- Drop FAQ tracker table
IF OBJECT_ID('dbo.FAQTracker', 'U') IS NOT NULL
    DROP TABLE dbo.FAQTracker;
PRINT '- Removed FAQTracker table';

-- Drop analytics snapshots table
IF OBJECT_ID('dbo.AnalyticsSnapshots', 'U') IS NOT NULL
    DROP TABLE dbo.AnalyticsSnapshots;
PRINT '- Removed AnalyticsSnapshots table';

-- ============================================================================
-- Step 3: Remove AI-related stored procedures
-- ============================================================================

PRINT '';
PRINT 'Removing AI-related stored procedures...';

-- Remove AI content generation procedure
IF OBJECT_ID('dbo.sp_GenerateCourseContentFromPDF', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GenerateCourseContentFromPDF;
PRINT '- Removed sp_GenerateCourseContentFromPDF procedure';

-- Remove FAQ tracking procedure
IF OBJECT_ID('dbo.sp_TrackFAQQuestion', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_TrackFAQQuestion;
PRINT '- Removed sp_TrackFAQQuestion procedure';

-- ============================================================================
-- Step 4: Clean up courses table (remove AI-generated content references)
-- ============================================================================

PRINT '';
PRINT 'Cleaning up courses table...';

-- Remove AI-generated content flags/statuses
UPDATE Courses 
SET 
    SourcePdfUrl = NULL,  -- Remove PDF source URLs since we're not using AI anymore
    Status = CASE 
        WHEN Status = 'Processing' THEN 'Draft'
        WHEN Status = 'AI_Generated' THEN 'Draft'
        ELSE Status
    END
WHERE Status IN ('Processing', 'AI_Generated');

PRINT 'Updated courses table to remove AI references';

-- ============================================================================
-- Step 5: Update module and lesson content to remove AI references
-- ============================================================================

PRINT '';
PRINT 'Cleaning up modules and lessons...';

-- Remove any AI-generated flags or content types
UPDATE Modules 
SET Description = Description 
WHERE Description LIKE '%AI%' OR Description LIKE '%generated%';

UPDATE Lessons 
SET 
    ContentType = CASE 
        WHEN ContentType = 'AI_Generated' THEN 'Manual'
        ELSE ContentType
    END,
    Content = Content  -- Keep existing content but remove AI flag
WHERE ContentType = 'AI_Generated' OR Content LIKE '%AI generated%';

PRINT 'Updated modules and lessons';

-- ============================================================================
-- Step 6: Add manual content management fields
-- ============================================================================

PRINT '';
PRINT 'Adding manual content management fields...';

-- Add fields to track manual content creation
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Courses') AND name = 'IsManuallyCreated')
    ALTER TABLE Courses ADD IsManuallyCreated BIT DEFAULT 1;
PRINT '- Added IsManuallyCreated field to Courses table';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modules') AND name = 'CreatedManually')
    ALTER TABLE Modules ADD CreatedManually BIT DEFAULT 1;
PRINT '- Added CreatedManually field to Modules table';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Lessons') AND name = 'CreatedManually')
    ALTER TABLE Lessons ADD CreatedManually BIT DEFAULT 1;
PRINT '- Added CreatedManually field to Lessons table';

-- ============================================================================
-- Step 7: Remove AI-related permissions (if any)
-- ============================================================================

PRINT '';
PRINT 'Cleaning up permissions...';

-- Remove AI-related permissions
DELETE FROM RolePermissions 
WHERE PermissionId IN (
    SELECT PermissionId FROM Permissions 
    WHERE PermissionName LIKE '%AI%' OR PermissionName LIKE '%OpenRouter%' OR PermissionName LIKE '%Chat%'
);

-- Remove AI-related permission definitions
DELETE FROM Permissions 
WHERE PermissionName LIKE '%AI%' OR PermissionName LIKE '%OpenRouter%' OR PermissionName LIKE '%Chat%';

PRINT 'Removed AI-related permissions';

-- ============================================================================
-- Step 8: Remove audit log entries related to AI
-- ============================================================================

PRINT '';
PRINT 'Cleaning up audit logs...';

DELETE FROM AuditLog 
WHERE ActionType LIKE '%AI%' 
   OR ActionType LIKE '%OpenRouter%' 
   OR ActionType LIKE '%Chat%'
   OR ActionType LIKE '%Generate%';

PRINT 'Removed AI-related audit log entries';

-- ============================================================================
-- Step 9: Remove AI-related user activity logs
-- ============================================================================

PRINT '';
PRINT 'Cleaning up user activity logs...';

DELETE FROM UserActivity 
WHERE ActivityType LIKE '%AI%' 
   OR ActivityType LIKE '%OpenRouter%' 
   OR ActivityType LIKE '%Chat%'
   OR ActivityType LIKE '%Generate%';

PRINT 'Removed AI-related user activity logs';

-- ============================================================================
-- Step 10: Reset sequences and clean up
-- ============================================================================

PRINT '';
PRINT 'Performing final cleanup...';

-- Reset identity columns if needed (optional)
-- DBCC CHECKIDENT ('Courses', RESEED, 0);
-- DBCC CHECKIDENT ('Modules', RESEED, 0);
-- DBCC CHECKIDENT ('Lessons', RESEED, 0);

-- Update statistics for better performance
UPDATE STATISTICS Courses;
UPDATE STATISTICS Modules;
UPDATE STATISTICS Lessons;
UPDATE STATISTICS Users;
UPDATE STATISTICS Enrollments;

PRINT 'Statistics updated';

-- ============================================================================
-- Step 11: Verify cleanup
-- ============================================================================

PRINT '';
PRINT 'Verification - Checking remaining AI-related data...';

-- Check for any remaining AI references
DECLARE @AICount INT;
SELECT @AICount = COUNT(*) 
FROM Courses 
WHERE Title LIKE '%AI%' OR Description LIKE '%AI%' OR SourcePdfUrl IS NOT NULL;

IF @AICount = 0
    PRINT '✓ No AI references found in Courses table';
ELSE
    PRINT '⚠ Found ' + CAST(@AICount AS VARCHAR) + ' AI references in Courses table';

-- Check if AI tables are removed
IF OBJECT_ID('dbo.ChatSessions', 'U') IS NULL
    PRINT '✓ ChatSessions table successfully removed';
ELSE
    PRINT '⚠ ChatSessions table still exists';

IF OBJECT_ID('dbo.ChatMessages', 'U') IS NULL
    PRINT '✓ ChatMessages table successfully removed';
ELSE
    PRINT '⚠ ChatMessages table still exists';

IF OBJECT_ID('dbo.FAQTracker', 'U') IS NULL
    PRINT '✓ FAQTracker table successfully removed';
ELSE
    PRINT '⚠ FAQTracker table still exists';

-- ============================================================================
-- Summary
-- ============================================================================

PRINT '';
PRINT '============================================================================';
PRINT 'AI Components Removal Complete!';
PRINT '============================================================================';
PRINT '';
PRINT 'Summary of changes:';
PRINT '- Removed AI chat functionality (ChatSessions, ChatMessages tables)';
PRINT '- Removed AI FAQ tracking (FAQTracker table)';
PRINT '- Removed AI analytics (AnalyticsSnapshots table)';
PRINT '- Removed AI-related stored procedures';
PRINT '- Cleaned up AI references from existing data';
PRINT '- Added manual content tracking fields';
PRINT '- Removed AI-related permissions and audit logs';
PRINT '';
PRINT 'Your database is now ready for manual course management without AI.';
PRINT 'You can now create courses, modules, and lessons manually through your admin panel.';
PRINT '';
PRINT '============================================================================';

GO