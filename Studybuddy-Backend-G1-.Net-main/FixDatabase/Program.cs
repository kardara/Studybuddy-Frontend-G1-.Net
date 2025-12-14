using System;
using System.Data.SqlClient;
using System.IO;

namespace FixDatabase
{
    class Program
    {
        static void Main(string[] args)
        {
            string connectionString = "Server=db33783.public.databaseasp.net,1433;Database=db33783;User Id=db33783;Password=Kardara123!;TrustServerCertificate=true;MultipleActiveResultSets=true";
            
            try
            {
                Console.WriteLine("Connecting to database...");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    Console.WriteLine("Connected successfully!");
                    
                    // Read and execute the SQL script
                    string sqlScript = File.ReadAllText("../create_missing_tables.sql");
                    
                    // Split script by GO statements
                    string[] batches = sqlScript.Split(new[] { "\nGO\n", "\nGO\r\n", "\r\nGO\n", "\r\nGO\r\n" }, StringSplitOptions.RemoveEmptyEntries);
                    
                    foreach (string batch in batches)
                    {
                        if (!string.IsNullOrWhiteSpace(batch))
                        {
                            try
                            {
                                using (SqlCommand command = new SqlCommand(batch.Trim(), connection))
                                {
                                    command.ExecuteNonQuery();
                                    Console.WriteLine("Executed batch successfully");
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Error executing batch: {ex.Message}");
                            }
                        }
                    }
                    
                    Console.WriteLine("Database fix completed successfully!");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
            }
            
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
    }
}