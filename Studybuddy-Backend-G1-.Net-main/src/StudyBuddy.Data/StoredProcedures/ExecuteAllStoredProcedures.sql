-- =============================================
-- StudyBuddy Database - Execute All Stored Procedures
-- This script executes all stored procedure creation scripts
-- =============================================

PRINT 'Creating StudyBuddy Stored Procedures...'
PRINT '==========================================='

-- Execute Authentication Procedures
PRINT 'Creating Authentication & Password Reset Procedures...'
GO
:r 01_AuthenticationProcedures.sql
GO

-- Execute Course Management Procedures
PRINT 'Creating Course Management Procedures...'
GO
:r 02_CourseManagementProcedures.sql
GO

-- Execute Quiz Management Procedures
PRINT 'Creating Quiz Management Procedures...'
GO
:r 03_QuizManagementProcedures.sql
GO

-- Execute Analytics & User Management Procedures
PRINT 'Creating Analytics & User Management Procedures...'
GO
:r 04_AnalyticsAndUserManagementProcedures.sql
GO

PRINT '==========================================='
PRINT 'All StudyBuddy Stored Procedures created successfully!'
PRINT 'Total procedures created: 16'
GO

-- Verify all procedures were created
SELECT 
    COUNT(*) as TotalProcedures,
    'sp_' as ProcedurePrefix
FROM sys.procedures 
WHERE name LIKE 'sp_%'

-- List all procedures for verification
SELECT 
    name as StoredProcedureName,
    create_date as CreatedDate,
    modify_date as ModifiedDate
FROM sys.procedures 
WHERE name LIKE 'sp_%'
ORDER BY name
GO