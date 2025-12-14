-- =============================================
-- StudyBuddy Stored Procedures - Authentication & Password Reset
-- =============================================

-- Procedure 1: Generate Password Reset Token
CREATE OR ALTER PROCEDURE sp_GeneratePasswordResetToken
    @UserId INT,
    @ResetToken NVARCHAR(500) OUTPUT,
    @TokenExpiration INT = 24
AS
BEGIN
    -- Generate random token
    SET @ResetToken = CONVERT(VARCHAR(64), HASHBYTES('SHA2_256',
        CONVERT(NVARCHAR(MAX), GETDATE()) + CONVERT(NVARCHAR(MAX), @UserId)), 2)

    -- Insert token
    INSERT INTO PasswordResetTokens (UserId, ResetToken, ExpiresAt, CreatedAt)
    VALUES (@UserId, @ResetToken, DATEADD(HOUR, @TokenExpiration, GETDATE()), GETDATE())
END
GO

-- Procedure 2: Verify and Reset Password
CREATE OR ALTER PROCEDURE sp_VerifyAndResetPassword
    @ResetToken NVARCHAR(500),
    @NewPasswordHash NVARCHAR(MAX),
    @IsValid BIT OUTPUT
AS
BEGIN
    DECLARE @UserId INT
    DECLARE @IsTokenValid BIT

    -- Check if token exists and is not expired
    SELECT @UserId = UserId, @IsTokenValid = 1
    FROM PasswordResetTokens
    WHERE ResetToken = @ResetToken
      AND IsUsed = 0
      AND ExpiresAt > GETDATE()

    SET @IsValid = ISNULL(@IsTokenValid, 0)

    IF @IsValid = 1
    BEGIN
        -- Update user password
        UPDATE Users
        SET PasswordHash = @NewPasswordHash,
            UpdatedAt = GETDATE()
        WHERE UserId = @UserId

        -- Mark token as used
        UPDATE PasswordResetTokens
        SET IsUsed = 1, UsedAt = GETDATE()
        WHERE ResetToken = @ResetToken
    END
END
GO