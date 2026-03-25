# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.



📱 Instrucciones para correr el proyecto ControlGastosRN

Instalar Node.js 18 o 20 LTS Verificar instalación en la terminal con: node -v

Clonar el repositorio: git clone https://github.com/AngelUch27/expense-tracker-ticket-scanner-react-native

Entrar a la carpeta del proyecto: cd ControlGastosRN

Instalar dependencias: npm install

Iniciar el proyecto con Expo: npx expo start

En el celular:

Descargar la app Expo Go (App Store o Play Store)

Abrir Expo Go

Escanear el código QR que aparece en la terminal o navegador

La aplicación se cargará automáticamente en el celular.

⚠️ Importante: La computadora y el celular deben estar conectados a la misma red WiFi.

## OCR con Google Document AI (setup rapido)

1. Instala Google Cloud SDK y autentica tu cuenta:

   ```bash
   gcloud auth login
   gcloud config set project TU_PROJECT_ID
   ```

2. Crea `.env` desde el ejemplo:

   ```bash
   cp .env.example .env
   ```

3. Completa en `.env`:
- `EXPO_PUBLIC_GOOGLE_DOC_AI_PROJECT_ID`
- `EXPO_PUBLIC_GOOGLE_DOC_AI_LOCATION` (ej. `us`)
- `EXPO_PUBLIC_GOOGLE_DOC_AI_PROCESSOR_ID`

4. Refresca token y arranca app:

   ```bash
   npm run dev:ocr
   ```

Notas:
- El token expira, cuando falle OCR vuelve a correr `npm run docai:token`.
- Este enfoque funciona en Expo Go porque OCR se hace en la API de Google.
