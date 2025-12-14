using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Models.Domain;
using System.Data;
using System.Data.Common;

namespace StudyBuddy.Data.StoredProcedures
{
    public class StoredProcedureExecutor
    {
        private readonly AppDbContext _context;

        public StoredProcedureExecutor(AppDbContext context)
        {
            _context = context;
        }

        public async Task<T> ExecuteScalarAsync<T>(string storedProcedureName, params (string parameterName, object value)[] parameters)
        {
            using var command = _context.Database.GetDbConnection().CreateCommand();
            command.CommandText = storedProcedureName;
            command.CommandType = CommandType.StoredProcedure;

            foreach (var (parameterName, value) in parameters)
            {
                var param = command.CreateParameter();
                param.ParameterName = parameterName;
                param.Value = value ?? DBNull.Value;
                command.Parameters.Add(param);
            }

            await _context.Database.OpenConnectionAsync();
            var result = await command.ExecuteScalarAsync();
            await _context.Database.CloseConnectionAsync();

            return result == null || result == DBNull.Value ? default! : (T)result!;
        }

        public async Task<int> ExecuteNonQueryAsync(string storedProcedureName, params (string parameterName, object value)[] parameters)
        {
            using var command = _context.Database.GetDbConnection().CreateCommand();
            command.CommandText = storedProcedureName;
            command.CommandType = CommandType.StoredProcedure;

            foreach (var (parameterName, value) in parameters)
            {
                var param = command.CreateParameter();
                param.ParameterName = parameterName;
                param.Value = value ?? DBNull.Value;
                command.Parameters.Add(param);
            }

            await _context.Database.OpenConnectionAsync();
            var result = await command.ExecuteNonQueryAsync();
            await _context.Database.CloseConnectionAsync();

            return result;
        }

        public async Task<List<T>> ExecuteQueryAsync<T>(string storedProcedureName, Func<IDataReader, T> mapper, params (string parameterName, object value)[] parameters)
        {
            var results = new List<T>();

            using var command = _context.Database.GetDbConnection().CreateCommand();
            command.CommandText = storedProcedureName;
            command.CommandType = CommandType.StoredProcedure;

            foreach (var (parameterName, value) in parameters)
            {
                var param = command.CreateParameter();
                param.ParameterName = parameterName;
                param.Value = value ?? DBNull.Value;
                command.Parameters.Add(param);
            }

            await _context.Database.OpenConnectionAsync();

            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                results.Add(mapper(reader));
            }

            await _context.Database.CloseConnectionAsync();

            return results;
        }

        public async Task<T?> ExecuteQuerySingleAsync<T>(string storedProcedureName, Func<IDataReader, T> mapper, params (string parameterName, object value)[] parameters)
        {
            using var command = _context.Database.GetDbConnection().CreateCommand();
            command.CommandText = storedProcedureName;
            command.CommandType = CommandType.StoredProcedure;

            foreach (var (parameterName, value) in parameters)
            {
                var param = command.CreateParameter();
                param.ParameterName = parameterName;
                param.Value = value ?? DBNull.Value;
                command.Parameters.Add(param);
            }

            await _context.Database.OpenConnectionAsync();

            using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                var result = mapper(reader);
                await _context.Database.CloseConnectionAsync();
                return result;
            }

            await _context.Database.CloseConnectionAsync();
            return default;
        }

        public async Task<(T1, T2)> ExecuteQueryWithOutputParametersAsync<T1, T2>(
            string storedProcedureName, 
            Func<IDataReader, T1> mapper,
            (string parameterName, object value)[] inputParameters,
            (string parameterName, DbType dbType)[] outputParameters)
        {
            using var command = _context.Database.GetDbConnection().CreateCommand();
            command.CommandText = storedProcedureName;
            command.CommandType = CommandType.StoredProcedure;

            // Add input parameters
            foreach (var (parameterName, value) in inputParameters)
            {
                var param = command.CreateParameter();
                param.ParameterName = parameterName;
                param.Value = value ?? DBNull.Value;
                command.Parameters.Add(param);
            }

            // Add output parameters
            var outputValues = new Dictionary<string, object>();
            foreach (var (parameterName, dbType) in outputParameters)
            {
                var param = command.CreateParameter();
                param.ParameterName = parameterName;
                param.DbType = dbType;
                param.Direction = ParameterDirection.Output;
                param.Size = 4000; // Default size
                command.Parameters.Add(param);
            }

            await _context.Database.OpenConnectionAsync();

            T1? result = default;
            
            using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                result = mapper(reader);
            }

            // Get output parameter values
            var outputResult1 = default(T2);
            if (outputParameters.Length > 0)
            {
                var firstOutputParam = command.Parameters[outputParameters[0].parameterName] as DbParameter;
                if (firstOutputParam?.Value != null && firstOutputParam.Value != DBNull.Value)
                {
                    outputResult1 = (T2)firstOutputParam.Value!;
                }
            }

            await _context.Database.CloseConnectionAsync();

            return (result!, outputResult1!);
        }
    }
}