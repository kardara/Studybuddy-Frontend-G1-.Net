-- =============================================
-- StudyBuddy Stored Procedures - Quiz Management
-- =============================================

-- Procedure 6: Grade Quiz Attempt
CREATE OR ALTER PROCEDURE sp_GradeQuizAttempt
    @AttemptId INT,
    @TotalScore INT OUTPUT,
    @MaxScore INT OUTPUT,
    @PercentageScore DECIMAL(5,2) OUTPUT,
    @IsPassed BIT OUTPUT
AS
BEGIN
    DECLARE @QuizId INT
    DECLARE @PassingPercentage INT

    -- Get quiz attempt details
    SELECT @QuizId = QuizId, @MaxScore = MaxScore
    FROM QuizAttempts
    WHERE AttemptId = @AttemptId

    -- Get passing percentage
    SELECT @PassingPercentage = PassingPercentage
    FROM Quizzes
    WHERE QuizId = @QuizId

    -- Calculate score based on correct answers
    SELECT @TotalScore = ISNULL(SUM(CASE WHEN sa.IsCorrect = 1 THEN q.Points ELSE 0 END), 0)
    FROM StudentAnswers sa
    INNER JOIN Questions q ON sa.QuestionId = q.QuestionId
    WHERE sa.AttemptId = @AttemptId

    -- Calculate percentage
    SET @PercentageScore = CASE
        WHEN @MaxScore = 0 THEN 0
        ELSE (@TotalScore * 100.0 / @MaxScore)
    END

    -- Check if passed
    SET @IsPassed = CASE WHEN @PercentageScore >= @PassingPercentage THEN 1 ELSE 0 END

    -- Update attempt
    UPDATE QuizAttempts
    SET TotalScore = @TotalScore,
        PercentageScore = @PercentageScore,
        CompletedAt = GETDATE(),
        Status = 'Graded'
    WHERE AttemptId = @AttemptId
END
GO

-- Procedure 7: Check if Student Can Retake Quiz
CREATE OR ALTER PROCEDURE sp_CanStudentRetakeQuiz
    @QuizId INT,
    @StudentId INT,
    @CanRetake BIT OUTPUT
AS
BEGIN
    DECLARE @MaxAttempts INT
    DECLARE @CurrentAttempts INT
    DECLARE @AllowRetake BIT

    -- Get quiz settings
    SELECT @MaxAttempts = MaxAttempts, @AllowRetake = AllowRetake
    FROM Quizzes
    WHERE QuizId = @QuizId

    -- Count student's attempts
    SELECT @CurrentAttempts = COUNT(*)
    FROM QuizAttempts
    WHERE QuizId = @QuizId
      AND StudentId = @StudentId
      AND Status = 'Graded'

    -- Determine if retake is allowed
    SET @CanRetake = CASE
        WHEN @AllowRetake = 0 THEN 0  -- Retake not allowed
        WHEN @CurrentAttempts < @MaxAttempts THEN 1  -- Still have attempts left
        ELSE 0  -- No attempts left
    END
END
GO

-- Procedure 8: Get Student Quiz Attempts
CREATE OR ALTER PROCEDURE sp_GetStudentQuizAttempts
    @StudentId INT,
    @CourseId INT = NULL
AS
BEGIN
    SELECT
        qa.AttemptId,
        qa.QuizId,
        q.Title AS QuizName,
        qa.StartedAt,
        qa.CompletedAt,
        qa.TotalScore,
        qa.MaxScore,
        qa.PercentageScore,
        qa.Status,
        qa.TimeSpentMinutes,
        q.PassingPercentage,
        CASE WHEN qa.PercentageScore >= q.PassingPercentage THEN 'Passed' ELSE 'Failed' END AS Result
    FROM QuizAttempts qa
    INNER JOIN Quizzes q ON qa.QuizId = q.QuizId
    WHERE qa.StudentId = @StudentId
      AND (@CourseId IS NULL OR qa.CourseId = @CourseId)
    ORDER BY qa.CompletedAt DESC
END
GO

-- Procedure 9: Check Certificate Eligibility
CREATE OR ALTER PROCEDURE sp_CheckCertificateEligibility
    @StudentId INT,
    @CourseId INT,
    @IsEligible BIT OUTPUT,
    @AllLessonsCompleted BIT OUTPUT,
    @AllQuizzesPasssed BIT OUTPUT
AS
BEGIN
    DECLARE @TotalLessons INT
    DECLARE @CompletedLessons INT
    DECLARE @TotalModuleQuizzes INT
    DECLARE @PassedQuizzes INT

    -- Check lessons completion
    SELECT @TotalLessons = COUNT(*)
    FROM Lessons
    WHERE CourseId = @CourseId

    SELECT @CompletedLessons = COUNT(*)
    FROM StudentProgress
    WHERE StudentId = @StudentId
      AND CourseId = @CourseId
      AND IsCompleted = 1

    SET @AllLessonsCompleted = CASE
        WHEN @CompletedLessons >= @TotalLessons THEN 1
        ELSE 0
    END

    -- Check quizzes passed
    SELECT @TotalModuleQuizzes = COUNT(DISTINCT q.QuizId)
    FROM Quizzes q
    INNER JOIN Modules m ON q.ModuleId = m.ModuleId
    WHERE m.CourseId = @CourseId

    SELECT @PassedQuizzes = COUNT(DISTINCT qa.QuizId)
    FROM QuizAttempts qa
    INNER JOIN Quizzes q ON qa.QuizId = q.QuizId
    INNER JOIN Modules m ON q.ModuleId = m.ModuleId
    WHERE qa.StudentId = @StudentId
      AND m.CourseId = @CourseId
      AND qa.PercentageScore >= q.PassingPercentage
      AND qa.Status = 'Graded'

    -- Overall eligibility: All lessons completed AND all quizzes passed
    SET @AllQuizzesPasssed = CASE
        WHEN @PassedQuizzes >= @TotalModuleQuizzes THEN 1
        ELSE 0
    END

    SET @IsEligible = CASE
        WHEN @AllLessonsCompleted = 1 AND @AllQuizzesPasssed = 1 THEN 1
        ELSE 0
    END
END
GO