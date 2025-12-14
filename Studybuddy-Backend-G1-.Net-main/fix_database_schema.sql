-- Fix missing Difficulty column in Questions table
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Questions' AND COLUMN_NAME = 'Difficulty')
BEGIN
    ALTER TABLE [Questions]
    ADD [Difficulty] nvarchar(20) NULL;
    PRINT 'Added Difficulty column to Questions table';
END
ELSE
BEGIN
    PRINT 'Difficulty column already exists in Questions table';
END

-- Verify the schema
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Questions'
ORDER BY ORDINAL_POSITION;
