-- =============================================
-- StudyBuddy Stored Procedures - Course Management
-- =============================================

-- Procedure 3: Calculate Course Progress
CREATE OR ALTER PROCEDURE sp_CalculateCourseProgress
    @StudentId INT,
    @CourseId INT,
    @ProgressPercentage DECIMAL(5,2) OUTPUT
AS
BEGIN
    DECLARE @TotalLessons INT
    DECLARE @CompletedLessons INT

    SELECT @TotalLessons = COUNT(*)
    FROM Lessons
    WHERE CourseId = @CourseId

    SELECT @CompletedLessons = COUNT(*)
    FROM StudentProgress
    WHERE StudentId = @StudentId
      AND CourseId = @CourseId
      AND IsCompleted = 1

    SET @ProgressPercentage = CASE
        WHEN @TotalLessons = 0 THEN 0
        ELSE (@CompletedLessons * 100.0 / @TotalLessons)
    END

    UPDATE Enrollments
    SET ProgressPercentage = @ProgressPercentage
    WHERE StudentId = @StudentId AND CourseId = @CourseId
END
GO

-- Procedure 4: Get Student Course Progress
CREATE OR ALTER PROCEDURE sp_GetStudentCourseProgress
    @StudentId INT,
    @CourseId INT
AS
BEGIN
    -- Get course enrollment info
    SELECT TOP 1
        e.EnrollmentId,
        e.StudentId,
        c.CourseId,
        c.Title AS CourseName,
        e.EnrolledAt,
        e.ProgressPercentage,
        e.Status,
        e.CompletedAt,
        COUNT(DISTINCT l.LessonId) AS TotalLessons,
        COUNT(DISTINCT sp.LessonId) AS CompletedLessons,
        CAST(CAST(COUNT(DISTINCT sp.LessonId) AS FLOAT) / COUNT(DISTINCT l.LessonId) * 100 AS DECIMAL(5,2)) AS CalculatedProgress
    FROM Enrollments e
    INNER JOIN Courses c ON e.CourseId = c.CourseId
    INNER JOIN Modules m ON c.CourseId = m.CourseId
    INNER JOIN Lessons l ON m.ModuleId = l.ModuleId
    LEFT JOIN StudentProgress sp ON l.LessonId = sp.LessonId
        AND sp.StudentId = @StudentId
        AND sp.IsCompleted = 1
    WHERE e.StudentId = @StudentId
      AND e.CourseId = @CourseId
    GROUP BY e.EnrollmentId, e.StudentId, c.CourseId, c.Title,
             e.EnrolledAt, e.ProgressPercentage, e.Status, e.CompletedAt
END
GO

-- Procedure 5: Mark Lesson As Complete
CREATE OR ALTER PROCEDURE sp_MarkLessonAsComplete
    @StudentId INT,
    @LessonId INT,
    @CourseId INT,
    @TimeSpentMinutes INT = 0
AS
BEGIN
    IF EXISTS (SELECT 1 FROM StudentProgress
               WHERE StudentId = @StudentId AND LessonId = @LessonId)
    BEGIN
        UPDATE StudentProgress
        SET IsCompleted = 1,
            CompletedAt = GETDATE(),
            TimeSpentMinutes = TimeSpentMinutes + @TimeSpentMinutes,
            LastAccessedAt = GETDATE()
        WHERE StudentId = @StudentId AND LessonId = @LessonId
    END
    ELSE
    BEGIN
        INSERT INTO StudentProgress (StudentId, LessonId, CourseId, IsCompleted, CompletedAt, TimeSpentMinutes, LastAccessedAt, CreatedAt)
        VALUES (@StudentId, @LessonId, @CourseId, 1, GETDATE(), @TimeSpentMinutes, GETDATE(), GETDATE())
    END

    -- Recalculate course progress
    DECLARE @ProgressPercentage DECIMAL(5,2)
    EXEC sp_CalculateCourseProgress @StudentId, @CourseId, @ProgressPercentage OUTPUT

    PRINT 'Lesson marked as complete. Course Progress: ' + CAST(@ProgressPercentage AS VARCHAR(10)) + '%'
END
GO