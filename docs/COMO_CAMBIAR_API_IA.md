# 📖 Guía de Configuración: Cambio de Proveedor y API de Inteligencia Artificial

Este documento explica cómo configurar y alternar entre los 5 principales proveedores de Inteligencia Artificial (**Google Gemini**, **OpenAI ChatGPT**, **Anthropic Claude**, **DeepSeek**, y **Groq / Llama 3**) en el sistema.

---

## ⚙️ 1. Archivo de Configuración (`.env`)

La selección de la IA y el manejo de sus credenciales se realiza a través de las variables de entorno ubicadas en el archivo `.env` del servidor backend.

**Ubicación del archivo:** `backend-php/.env`

### Variables de Entorno Disponibles:

```env
# Define qué proveedor de IA está activo: 'gemini', 'openai', 'anthropic', 'deepseek' o 'groq'
AI_PROVIDER=gemini

# 1. Credenciales para Google Gemini
GEMINI_API_KEY=tu_clave_api_de_gemini

# 2. Credenciales para OpenAI (ChatGPT)
OPENAI_API_KEY=tu_clave_api_de_openai
OPENAI_MODEL=gpt-4o-mini

# 3. Credenciales para Anthropic (Claude)
ANTHROPIC_API_KEY=tu_clave_api_de_anthropic
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# 4. Credenciales para DeepSeek
DEEPSEEK_API_KEY=tu_clave_api_de_deepseek
DEEPSEEK_MODEL=deepseek-chat

# 5. Credenciales para Groq (Llama 3 / Open Source a alta velocidad)
GROQ_API_KEY=tu_clave_api_de_groq
GROQ_MODEL=llama-3.1-70b-versatile
```

---

## 🔍 2. ¿Cómo funciona en el código fuente?

La lógica de enrutamiento y llamada a los modelos de inteligencia artificial está centralizada en el servicio:
📄 [AIService.php](file:///c:/Users/darwin%20roa/restrutura/backend-php/app/Services/AIService.php)

### Carga de Parámetros:
En el constructor del servicio, el sistema lee de forma segura las variables configuradas en tu archivo `.env`:
```php
public function __construct()
{
    $this->provider = env('AI_PROVIDER', 'gemini');
    $this->geminiApiKey = env('GEMINI_API_KEY');
    
    $this->openaiApiKey = env('OPENAI_API_KEY');
    $this->openaiModel = env('OPENAI_MODEL', 'gpt-4o-mini');
    
    $this->anthropicApiKey = env('ANTHROPIC_API_KEY');
    $this->anthropicModel = env('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022');
    
    $this->deepseekApiKey = env('DEEPSEEK_API_KEY');
    $this->deepseekModel = env('DEEPSEEK_MODEL', 'deepseek-chat');
    
    $this->groqApiKey = env('GROQ_API_KEY');
    $this->groqModel = env('GROQ_MODEL', 'llama-3.1-70b-versatile');
}
```

### Enrutamiento de Llamadas:
El método `callAI` decide a qué controlador de API enviar el prompt en función del proveedor activo en el archivo de entorno:
```php
private function callAI($prompt, $maxRetries = 5)
{
    if ($this->provider === 'openai') {
        return $this->callOpenAI($prompt, $maxRetries);
    }
    if ($this->provider === 'anthropic') {
        return $this->callAnthropic($prompt, $maxRetries);
    }
    if ($this->provider === 'deepseek') {
        return $this->callDeepSeek($prompt, $maxRetries);
    }
    if ($this->provider === 'groq') {
        return $this->callGroq($prompt, $maxRetries);
    }
    
    // Por defecto usa Gemini
    return $this->callGemini($prompt, $maxRetries);
}
```

---

## 🤖 3. Instrucciones de Configuración por Proveedor

### Opción A: Usar Google Gemini (Activo por defecto)
1. Obtén tu clave en [Google AI Studio](https://aistudio.google.com/).
2. Configura las variables en tu archivo `backend-php/.env`:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSy... (coloca tu clave real)
   ```

### Opción B: Cambiar a OpenAI (ChatGPT)
1. Obtén tu clave de API en [OpenAI Developer Platform](https://platform.openai.com/).
2. Modifica el archivo `.env`:
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-proj-... (coloca tu clave real)
   OPENAI_MODEL=gpt-4o-mini (o modelos como 'gpt-4o')
   ```

### Opción C: Cambiar a Anthropic (Claude 3.5)
1. Obtén tu clave de API en el portal de [Anthropic Console](https://console.anthropic.com/).
2. Modifica el archivo `.env`:
   ```env
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-api03-... (coloca tu clave real)
   ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
   ```

### Opción D: Cambiar a DeepSeek
1. Regístrate y genera tu clave en la [Plataforma de DeepSeek API](https://platform.deepseek.com/).
2. Modifica el archivo `.env`:
   ```env
   AI_PROVIDER=deepseek
   DEEPSEEK_API_KEY=sk-... (coloca tu clave real)
   DEEPSEEK_MODEL=deepseek-chat (o 'deepseek-reasoner' para R1)
   ```

### Opción E: Cambiar a Groq (Llama 3.1)
1. Consigue una API Key gratuita o de pago en [Groq Console](https://console.groq.com/).
2. Modifica el archivo `.env`:
   ```env
   AI_PROVIDER=groq
   GROQ_API_KEY=gsk_... (coloca tu clave real)
   GROQ_MODEL=llama-3.1-70b-versatile (o 'llama-3.3-70b-specdec')
   ```

---

## 🧹 4. Limpieza de Caché del Servidor (Importante)

Laravel almacena en caché la configuración del archivo de entorno en entornos de producción o pruebas continuas. Si cambias el proveedor en el `.env` y el sistema sigue utilizando el proveedor anterior, ejecuta el siguiente comando en la consola dentro de la carpeta `backend-php`:

```bash
php artisan config:clear
```
Y si es necesario, limpia toda la caché del framework:
```bash
php artisan cache:clear
```
