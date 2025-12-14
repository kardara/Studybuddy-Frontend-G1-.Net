-- =============================================
-- StudyBuddy Stored Procedures - Analytics & User Management
-- =============================================

-- Procedure 10: Get Admin Dashboard Metrics
CREATE OR ALTER PROCEDURE sp_GetAdminDashboardMetrics
    @TotalCourses INT OUTPUT,
    @TotalStudents INT OUTPUT,
    @TotalEnrollments INT OUTPUT,
    @AverageCompletionRate DECIMAL(5,2) OUTPUT,
    @ActiveUsersToday INT OUTPUT
AS
BEGIN
    SELECT @TotalCourses = COUNT(*) FROM Courses WHERE Status = 'Published'

    SELECT @TotalStudents = COUNT(*) FROM Users WHERE Role = 'Student'

    SELECT @TotalEnrollments = COUNT(*) FROM Enrollments WHERE Status = 'Active'

    SELECT @AverageCompletionRate = AVG(ProgressPercentage)
    FROM Enrollments WHERE Status = 'Active'

    SELECT @ActiveUsersToday = COUNT(DISTINCT UserId)
    FROM UserActivity
    WHERE CAST(CreatedAt AS DATE) = CAST(GETDATE() AS DATE)
END
GO

-- Procedure 11: Get Course Analytics
CREATE OR ALTER PROCEDURE sp_GetCourseAnalytics
    @CourseId INT
AS
BEGIN
    SELECT
        c.CourseId,
        c.Title AS CourseName,
        c.Status,
        c.CreatedAt,
        c.PublishedAt,
        COUNT(DISTINCT e.StudentId) AS TotalEnrollments,
        COUNT(DISTINCT CASE WHEN e.Status = 'Completed' THEN e.StudentId END) AS CompletedStudents,
        COUNT(DISTINCT CASE WHEN e.Status = 'Active' THEN e.StudentId END) AS ActiveStudents,
        CAST(COUNT(DISTINCT CASE WHEN e.Status = 'Completed' THEN e.StudentId END) AS FLOAT) /
            NULLIF(COUNT(DISTINCT e.StudentId), 0) * 100 AS CompletionRate,
        AVG(e.ProgressPercentage) AS AverageProgress,
        COUNT(DISTINCT cert.CertificateId) AS CertificatesIssued
    FROM Courses c
    LEFT JOIN Enrollments e ON c.CourseId = e.CourseId
    LEFT JOIN Certificates cert ON c.CourseId = cert.CourseId
    WHERE c.CourseId = @CourseId
    GROUP BY c.CourseId, c.Title, c.Status, c.CreatedAt, c.PublishedAt
END
GO

-- Procedure 12: Get Top FAQ Questions
CREATE OR ALTER PROCEDURE sp_GetTopFAQQuestions
    @CourseId INT = NULL,
    @TopCount INT = 10
AS
BEGIN
    SELECT TOP (@TopCount)
        FAQId,
        Question,
        CourseId,
        AskCount,
        LastAskedAt
    FROM FAQTracker
    WHERE (@CourseId IS NULL OR CourseId = @CourseId)
    ORDER BY AskCount DESC, LastAskedAt DESC
END
GO

-- Procedure 13: Block User
CREATE OR ALTER PROCEDURE sp_BlockUser
    @UserId INT,
    @AdminId INT,
    @BlockReason NVARCHAR(MAX),
    @IsBlock BIT
AS
BEGIN
    -- Update user status
    UPDATE Users
    SET IsBlocked = @IsBlock,
        BlockReason = CASE WHEN @IsBlock = 1 THEN @BlockReason ELSE NULL END,
        UpdatedAt = GETDATE()
    WHERE UserId = @UserId

    -- Log the action
    INSERT INTO AuditLog (UserId, ActionType, EntityType, EntityId, NewValues, CreatedAt)
    VALUES (@AdminId,
            CASE WHEN @IsBlock = 1 THEN 'BlockUser' ELSE 'UnblockUser' END,
            'User',
            @UserId,
            JSON_OBJECT('IsBlocked', @IsBlock, 'BlockReason', @BlockReason),
            GETDATE())
END
GO

-- Procedure 14: Track FAQ Question
CREATE OR ALTER PROCEDURE sp_TrackFAQQuestion
    @Question NVARCHAR(MAX),
    @CourseId INT = NULL
AS
BEGIN
    IF EXISTS (SELECT 1 FROM FAQTracker WHERE Question = @Question AND CourseId = @CourseId)
    BEGIN
        UPDATE FAQTracker
        SET AskCount = AskCount + 1, LastAskedAt = GETDATE()
        WHERE Question = @Question AND CourseId = @CourseId
    END
    ELSE
    BEGIN
        INSERT INTO FAQTracker (Question, CourseId, AskCount, LastAskedAt)
        VALUES (@Question, @CourseId, 1, GETDATE())
    END
END
GO

-- Procedure 15: Issue Certificate (if not exists in previous procedures)
CREATE OR ALTER PROCEDURE sp_IssueCertificate
    @StudentId INT,
    @CourseId INT,
    @CertificateTemplateId INT
AS
BEGIN
    DECLARE @CertificateNumber NVARCHAR(100)
    DECLARE @IssuedAt DATETIME = GETDATE()

    -- Generate unique certificate number
    SET @CertificateNumber = 'CERT-' + CONVERT(NVARCHAR(10), @StudentId) +
                             '-' + CONVERT(NVARCHAR(10), @CourseId) +
                             '-' + CONVERT(NVARCHAR(10), DATEPART(YEAR, @IssuedAt))

    INSERT INTO Certificates (StudentId, CourseId, CertificateNumber, IssuedAt)
    VALUES (@StudentId, @CourseId, @CertificateNumber, @IssuedAt)

    -- Mark course as completed
    UPDATE Enrollments
    SET Status = 'Completed', CompletedAt = @IssuedAt
    WHERE StudentId = @StudentId AND CourseId = @CourseId
END
GO

-- Procedure 16: Generate Course Content from PDF (placeholder for AI integration)
CREATE OR ALTER PROCEDURE sp_GenerateCourseContentFromPDF
    @CourseId INT,
    @AdminUserId INT
AS
BEGIN
    DECLARE @Status NVARCHAR(20) = 'Processing'

    -- Update status
    UPDATE Courses SET Status = @Status WHERE CourseId = @CourseId

    -- This SP will be called from C# after AI processing
    -- Insert modules from AI response
    -- Insert lessons from AI response
    -- Insert lesson materials (YouTube links, etc.)

    UPDATE Courses SET Status = 'Published' WHERE CourseId = @CourseId
END
GO