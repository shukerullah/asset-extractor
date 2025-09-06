# 🔌 API Reference

The Asset Extractor backend provides a simple REST API for AI-powered background removal.

## Base URL

```
https://your-railway-app.railway.app
```

## Endpoints

### Health Check

```http
GET /health
```

Returns the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1640995200.0,
  "model_loaded": true
}
```

### Remove Background

```http
POST /remove-background
```

Remove background from an uploaded image.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (file) - Image file to process

**Supported formats:**
- JPEG
- PNG  
- WebP
- BMP

**Limits:**
- Max file size: 10MB

**Response:**
- Content-Type: `image/png`
- Body: PNG image with transparent background

**Headers:**
- `X-Processing-Time`: Processing time in seconds
- `X-Input-Size`: Original image size in bytes
- `X-Output-Size`: Processed image size in bytes

**Example:**
```bash
curl -X POST \
  -F "image=@my-image.jpg" \
  https://your-railway-app.railway.app/remove-background \
  -o result.png
```

### List Available Models

```http
GET /models
```

Get information about available AI models.

**Response:**
```json
{
  "models": [
    "u2net",
    "u2netp", 
    "u2net_human_seg",
    "u2net_cloth_seg",
    "isnet-general-use"
  ],
  "current": "u2net",
  "loaded": true
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "No image file provided"
}
```

### 413 Payload Too Large
```json
{
  "detail": "File too large. Maximum file size is 10MB"
}
```

### 415 Unsupported Media Type
```json
{
  "detail": "Unsupported file format. Supported: image/jpeg, image/png, image/webp, image/bmp"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Background removal processing failed"
}
```

## Interactive Documentation

When the backend is running, visit `/docs` for interactive Swagger documentation:

```
https://your-railway-app.railway.app/docs
```

## Rate Limiting

The API is currently configured without rate limiting on Railway. For production use, consider adding rate limiting based on your needs.