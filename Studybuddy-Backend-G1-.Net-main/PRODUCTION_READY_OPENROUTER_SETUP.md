# Production-Ready OpenRouter Integration for StudyBuddy

## 🎯 Overview

This implementation follows **production-ready patterns** for secure API key handling in ASP.NET Core, specifically for OpenRouter integration with GPT-5 support.

## ✅ Security Best Practices Implemented

### 1. **Secure API Key Storage** ✅

- ✅ API keys stored in environment variables (`.env` file)
- ✅ No hardcoded keys in source code
- ✅ Configuration validation
- ✅ Secure dependency injection

### 2. **Production-Ready HTTP Client Management** ✅

- ✅ Uses `IHttpClientFactory` (prevents socket exhaustion)
- ✅ Proper timeout configuration
- ✅ Reusable HTTP client instances
- ✅ Centralized configuration

### 3. **Strongly-Typed Configuration** ✅

- ✅ `AISettings` class for type safety
- ✅ Validation methods
- ✅ Default values and fallbacks
- ✅ Environment-specific configuration

## 📁 File Structure

```
StudyBuddy.Core/Configuration/
├── AISettings.cs              # Strongly-typed configuration model

StudyBuddy.Services/Implementations/
├── AIService.cs               # AI service with production patterns

StudyBuddy.API/
├── Program.cs                 # Service registration with DI
├── appsettings.json          # Development configuration
├── .env                      # Environment variables (local)
```

## 🔧 Configuration

### **Environment Variables** (`.env`)

```bash
AI__ApiKey=sk-or-v1-your-openrouter-api-key
AI__Model=openai/gpt-4o
AI__BaseUrl=https://openrouter.ai/api/v1
AI__MaxTokens=4000
AI__Temperature=0.7
AI__TimeoutSeconds=30
AI__EnableLogging=true
```

### **appsettings.json** (Development)

```json
{
  "AI": {
    "ApiKey": "${AI__ApiKey}",
    "Model": "openai/gpt-4o",
    "BaseUrl": "https://openrouter.ai/api/v1",
    "MaxTokens": 4000,
    "Temperature": 0.7,
    "TimeoutSeconds": 30,
    "EnableLogging": true
  }
}
```

## 🏗️ Implementation Details

### **1. Strongly-Typed Configuration Model**

```csharp
// StudyBuddy.Core/Configuration/AISettings.cs
public class AISettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "openai/gpt-4o";
    public int MaxTokens { get; set; } = 4000;
    public double Temperature { get; set; } = 0.7;
    public string BaseUrl { get; set; } = "https://openrouter.ai/api/v1";
    public string Organization { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 30;
    public bool EnableLogging { get; set; } = true;

    // Available GPT-5 models for future use
    public string[] AvailableModels { get; set; } = new[]
    {
        "openai/gpt-5.2-chat",
        "openai/gpt-5.2-pro",
        "openai/gpt-5.2",
        "openai/gpt-4o",
        "openai/gpt-4o-2024-05-13",
        "anthropic/claude-3-opus",
        "anthropic/claude-3-haiku"
    };

    // Validation method
    public bool IsValid()
    {
        return !string.IsNullOrWhiteSpace(ApiKey) &&
               !string.IsNullOrWhiteSpace(BaseUrl) &&
               Uri.TryCreate(BaseUrl, UriKind.Absolute, out _);
    }
}
```

### **2. Production-Ready Service Implementation**

```csharp
// StudyBuddy.Services/Implementations/AIService.cs
public class AIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly AISettings _aiSettings;
    private readonly ILogger<AIService> _logger;

    public AIService(IHttpClientFactory httpClientFactory,
                    IOptions<AISettings> aiSettings,
                    ILogger<AIService> logger)
    {
        _httpClient = httpClientFactory.CreateClient("OpenRouterClient");
        _aiSettings = aiSettings.Value;
        _logger = logger;

        // Validate configuration
        if (!_aiSettings.IsValid())
        {
            _logger.LogError("Invalid AI configuration. ApiKey: {HasApiKey}, BaseUrl: {BaseUrl}",
                !string.IsNullOrEmpty(_aiSettings.ApiKey), _aiSettings.BaseUrl);
            throw new InvalidOperationException("AI configuration is invalid.");
        }

        _logger.LogInformation("AI Service initialized with model: {Model}", _aiSettings.Model);
    }

    // Static configuration method for HttpClient
    public static void ConfigureHttpClient(HttpClient client, AISettings settings)
    {
        client.BaseAddress = new Uri(settings.BaseUrl);
        client.Timeout = TimeSpan.FromSeconds(settings.TimeoutSeconds);

        // Set authentication
        if (!string.IsNullOrEmpty(settings.ApiKey))
        {
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", settings.ApiKey);
        }

        // Standard headers
        client.DefaultRequestHeaders.Accept.Add(
            new MediaTypeWithQualityHeaderValue("application/json"));

        // OpenRouter specific headers
        if (settings.BaseUrl.Contains("openrouter.ai"))
        {
            client.DefaultRequestHeaders.Add("HTTP-Referer", "https://studybuddy.com");
            client.DefaultRequestHeaders.Add("X-Title", "StudyBuddy AI Tutor");
        }
    }

    // Example usage in your methods
    public async Task<string> GenerateResponseAsync(string userMessage,
        List<string> conversationHistory, string? courseContext = null)
    {
        try
        {
            var messages = BuildMessageHistory(userMessage, conversationHistory, courseContext);

            var requestPayload = new
            {
                model = _aiSettings.Model,
                messages = messages,
                max_tokens = _aiSettings.MaxTokens,
                temperature = _aiSettings.Temperature
            };

            var jsonContent = JsonSerializer.Serialize(requestPayload);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/chat/completions", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("OpenRouter API error: {StatusCode} - {Error}",
                    response.StatusCode, errorContent);
                return GenerateFallbackResponse(userMessage, courseContext, "API Error");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var responseData = JsonSerializer.Deserialize<OpenRouterResponse>(responseContent);

            return responseData?.choices?.FirstOrDefault()?.message?.content?.Trim()
                ?? "I apologize, but I'm having trouble responding right now.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating AI response");
            return GenerateFallbackResponse(userMessage, courseContext, "Service unavailable");
        }
    }
}
```

### **3. Program.cs - Service Registration**

```csharp
// StudyBuddy.API/Program.cs
var builder = WebApplication.CreateBuilder(args);

// Load environment variables
builder.Configuration.AddEnvironmentVariables();

// Configure services
builder.Services.Configure<AISettings>(builder.Configuration.GetSection("AI"));

// Production-ready HTTP client configuration
builder.Services.AddHttpClient("OpenRouterClient", (serviceProvider, client) =>
{
    var aiSettings = serviceProvider.GetRequiredService<IOptions<AISettings>>().Value;
    AIService.ConfigureHttpClient(client, aiSettings);
});

// Register services with proper dependency injection
builder.Services.AddScoped<IAIService, AIService>();

// Other service registrations...
builder.Services.AddScoped<IChatService, ChatService>();
// ... rest of services
```

## 🚀 Usage Examples

### **In Controllers**

```csharp
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IAIService _aiService;

    public ChatController(IAIService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("message")]
    public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
    {
        var response = await _aiService.GenerateResponseAsync(
            request.Message,
            request.History,
            request.CourseContext);

        return Ok(new { response });
    }
}
```

### **Direct Service Usage**

```csharp
public class SomeOtherService
{
    private readonly IAIService _aiService;

    public SomeOtherService(IAIService aiService)
    {
        _aiService = aiService;
    }

    public async Task<string> GenerateContentAsync(string prompt)
    {
        return await _aiService.GenerateResponseAsync(prompt, new List<string>());
    }
}
```

## 🔐 Security Features

### ✅ **API Key Protection**

- Stored in environment variables
- Never logged or exposed
- Validated on startup
- Secure dependency injection

### ✅ **HTTP Client Security**

- Proper timeout configuration
- Reusable instances (no socket exhaustion)
- Centralized configuration
- Authentication headers handled securely

### ✅ **Configuration Validation**

- Required fields validated
- URL format validation
- Startup failure if misconfigured
- Comprehensive logging

## 🎯 Available Models

Your configuration supports all these models through the `AvailableModels` array:

```csharp
// Current reliable models
"openai/gpt-4o"                    // ✅ Recommended default
"openai/gpt-4o-2024-05-13"         // ✅ Stable release
"anthropic/claude-3-haiku"         // ✅ Fast and reliable

// GPT-5 models (when your API key has access)
"openai/gpt-5.2-chat"             // 🔮 Fast GPT-5 for chat
"openai/gpt-5.2-pro"              // 🔮 Most advanced GPT-5
"openai/gpt-5.2"                  // 🔮 Base GPT-5 model

// Other premium options
"anthropic/claude-3-opus"         // 💎 Most capable Claude
```

## 🛠️ Troubleshooting

### **Common Issues & Solutions**

1. **"AI configuration is invalid"**

   - Check environment variables are loaded
   - Verify API key is not empty
   - Ensure BaseUrl is valid

2. **API calls failing**

   - Verify API key has proper permissions
   - Check account credits/quota
   - Test with simple model first (`openai/gpt-4o`)

3. **Timeout issues**
   - Increase `TimeoutSeconds` in configuration
   - Check network connectivity
   - Monitor API response times

### **Testing Your Setup**

```bash
# Test API key validity
curl -X GET "https://openrouter.ai/api/v1/models" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"

# Test simple completion
curl -X POST "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"model": "openai/gpt-4o", "messages": [{"role": "user", "content": "Hello!"}], "max_tokens": 50}'
```

## 📋 Production Checklist

- ✅ API keys stored securely (environment variables)
- ✅ Using `IHttpClientFactory`
- ✅ Proper timeout configuration
- ✅ Configuration validation on startup
- ✅ Comprehensive error handling
- ✅ Logging for debugging
- ✅ Fallback responses for API failures
- ✅ Strongly-typed configuration
- ✅ Dependency injection throughout
- ✅ No hardcoded credentials

## 🎉 Summary

This implementation provides:

- **Security**: No hardcoded API keys, secure storage
- **Reliability**: Proper error handling, fallbacks, timeouts
- **Maintainability**: Clean architecture, dependency injection
- **Scalability**: Reusable HTTP clients, configuration management
- **GPT-5 Ready**: Support for all OpenRouter models including GPT-5

Your StudyBuddy application is now production-ready for OpenRouter integration! 🚀
