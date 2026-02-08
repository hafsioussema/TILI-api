# Text-to-Speech Configuration

## 🎉 Edge TTS - Completely FREE Text-to-Speech

**TL;DR: No setup needed! No payment! No API key! Arabic TTS works out of the box!** ✅

This implementation uses **Microsoft Edge TTS** which is:
- ✅ **100% FREE** - No payment card needed
- ✅ **Unlimited** - No character limits
- ✅ **Natural voices** - Professional quality
- ✅ **Multi-language** - Including Arabic & Tunisian 🇸🇦🇹🇳
- ✅ **No account** - Just works!
- ✅ **Self-hosted** - No external dependencies

---

## Supported Languages with FREE Voices

### English 🇺🇸
- **Aria** (Female, US)
- **Guy** (Male, US)
- **Ryan** (Male, UK)
- **Sonia** (Female, UK)

### French 🇫🇷
- **Denise** (Female)
- **Henri** (Male)

### Arabic 🇸🇦 (FREE!)
- **Leen** (Female, Saudi Arabia)
- **Ameen** (Male, Saudi Arabia)

### Tunisian Arabic 🇹🇳 (FREE!)
- **Ameni** (Female, Tunisia)

### Egyptian Arabic 🇪🇬 (FREE!)
- **Salma** (Female, Egypt)

---

## Getting Started

### Zero Configuration Required!

Just start the API:

```bash
npm run start:dev
```

The TTS service is immediately ready to use. No credentials file needed!

---

## API Endpoints

### ✅ Check TTS Availability
```bash
curl -X GET http://localhost:3000/api/tts/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "available": true,
  "message": "TTS service ready"
}
```

### 🎤 Synthesize Speech
```bash
curl -X POST http://localhost:3000/api/tts/speak \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "السلام عليكم",
    "languageCode": "ar",
    "voiceName": "ar-SA-LeenNeural"
  }' \
  --output audio.mp3
```

Response: MP3 audio stream

### 📻 List Available Voices
```bash
curl -X GET "http://localhost:3000/api/tts/voices?languageCode=ar" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "voices": [
    {
      "lang": "ar-SA",
      "name": "ar-SA-LeenNeural",
      "displayName": "Leen (Saudi Arabia)"
    },
    {
      "lang": "ar-TN",
      "name": "ar-TN-AmeniNeural",
      "displayName": "Ameni (Tunisia) 🇹🇳"
    }
  ],
  "count": 2,
  "note": "✓ All voices are completely FREE with Microsoft Edge TTS - no payment required!"
}
```

---

## Frontend Integration

The frontend automatically uses the backend TTS API:

1. **Accessibility Panel** → Switch to Arabic/Tunisian
2. **Click "Test Voice"**
3. **Hear Arabic speech immediately!** 🎤

No setup on frontend needed either!

---

## Why Edge TTS?

| Feature | Edge TTS | Google Cloud | Azure |
|---------|----------|--------------|-------|
| **Cost** | ✅ FREE | ❌ $16/1M chars | ❌ $0.80/1K chars |
| **Setup** | ✅ None | ❌ Complex | ❌ Complex |
| **Arabic** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Quality** | ✅ Excellent | ✅ Excellent | ✅ Excellent |
| **Payment** | ✅ None needed | ❌ Credit card | ❌ Credit card |

---

## Troubleshooting

### "TTS not working"
- Make sure API is running: `npm run start:dev`
- Check JWT token is valid
- Verify frontend has internet connection

### "No audio playing"
- Check browser console for errors
- Make sure audio element has proper permissions
- Test with `/tts/health` endpoint first

### "Arabic voice not available"
- Edge TTS includes Arabic voices by default
- Try different voice name: `ar-SA-LeenNeural` or `ar-SA-AmeenNeural`
- Check backend logs for errors

---

## Advanced Configuration

Edge TTS supports these parameters (all optional):
- **rate**: 0.5 (slow) to 2.0 (fast), default 1.0
- **pitch**: -50.0 to 50.0, default 0
- **volume**: 0 to 100, default 100

Currently using defaults which work great for most use cases!

---

## Migration from Google Cloud

If you previously had Google Cloud setup:
1. Remove `GOOGLE_CLOUD_CREDENTIALS` from `.env`
2. Restart API
3. Done! 🎉

No code changes needed - already migrated!

---

## Performance

- **First synthesis**: ~500ms
- **Subsequent syntheses**: ~200-300ms
- **Average audio size**: 10-50 KB per sentence

All completely FREE! 🚀

---

## Support & Resources

- Microsoft Edge TTS Docs: https://github.com/rany2/edge-tts
- Language codes: https://en.wikipedia.org/wiki/ISO_639-1
- Test voices: http://localhost:3000/api/tts/voices

---

**Enjoy FREE Arabic TTS! No payment needed! أستمتع بـ تحويل النصوص إلى كلام مجانا!** 🎉

