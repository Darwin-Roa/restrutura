# 📖 Guía de Configuración: Cambio de Proveedor y API de Inteligencia Artificial

Este documento explica cómo configurar y alternar entre los diferentes proveedores de Inteligencia Artificial (**Google Gemini** y **OpenAI ChatGPT**) en el sistema.

---

## ⚙️ 1. Archivo de Configuración (`.env`)

La selección de la IA y el manejo de sus credenciales se realiza a través de las variables de entorno ubicadas en el archivo `.env` del servidor backend.

**Ubicación del archivo:** `backend-php/.env`

### Variables de Entorno Clave:

```env
# Define qué proveedor de IA está activo: 'gemini' o 'openai'
AI_PROVIDER=gemini

# Credenciales para Google Gemini (Por defecto)
GEMINI_API_KEY=tu_clave_api_de_gemini

# Credenciales para OpenAI (ChatGPT)
OPENAI_API_KEY=tu_clave_api_de_openai
OPENAI_MODEL=gpt-4o-mini
```

---

## 🔍 2. ¿Cómo funciona en el código fuente?

La lógica de enrutamiento y llamada a los modelos de inteligencia artificial está centralizada en el servicio:
📄 [AIService.php](file:///c:/Users/darwin%20roa/restrutura/backend-php/app/Services/AIService.php)

### Carga de Parámetros:
En el constructor del servicio (líneas 20-26), el sistema lee las variables del archivo `.env`:
```php
public function __construct()
{
    $this->provider = env('AI_PROVIDER', 'gemini');
    $this->geminiApiKey = env('GEMINI_API_KEY');
    $this->openaiApiKey = env('OPENAI_API_KEY');
    $this->openaiModel = env('OPENAI_MODEL', 'gpt-4o-mini');
}
```

### Enrutamiento de Llamadas:
El método `callAI` (líneas 31-39) decide a qué API enviar el prompt en función del proveedor activo:
```php
private function callAI($prompt, $maxRetries = 5)
{
    if ($this->provider === 'openai') {
        return $this->callOpenAI($prompt, $maxRetries);
    }
    
    // Por defecto usa Gemini
    return $this->callGemini($prompt, $maxRetries);
}
```

---

## 🤖 3. Instrucciones paso a paso para cambiar de API

### Opción A: Usar Google Gemini (Activo por defecto)
1. Inicie sesión en [Google AI Studio](https://aistudio.google.com/) y genere una API Key.
2. Abra el archivo `backend-php/.env`.
3. Configure las variables de la siguiente forma:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSy... (coloque aquí su clave real)
   ```

### Opción B: Cambiar a OpenAI (ChatGPT)
1. Obtenga su clave de API de la plataforma de desarrollo de [OpenAI](https://platform.openai.com/).
2. Abra el archivo `backend-php/.env`.
3. Modifique las variables para activar OpenAI:
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-proj-... (coloque aquí su clave real)
   OPENAI_MODEL=gpt-4o-mini (o el modelo deseado como 'gpt-4o')
   ```

---

## 🧹 4. Limpieza de Caché del Servidor (Importante)
En entornos de desarrollo y producción, Laravel a veces almacena en caché el archivo de configuración. Si cambia una clave en el `.env` y el sistema parece no enterarse, ejecute el siguiente comando en la carpeta `backend-php` para borrar la caché:

```bash
php artisan config:clear
```

---

## 🛠️ 5. Modificar el Modelo de Gemini en el Código
Si desea actualizar la versión o modelo que utiliza Gemini (por ejemplo, cambiar de `gemini-3.5-flash` a `gemini-1.5-pro`), puede hacerlo directamente editando la línea 14 de [AIService.php](file:///c:/Users/darwin%20roa/restrutura/backend-php/app/Services/AIService.php#L14):

```php
private $geminiModel = 'gemini-3.5-flash'; // Cambie el texto por el nombre del modelo deseado
```
