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

## OCR con backend (sin gcloud en cada laptop)

Ahora OCR se hace en un backend Cloud Run (`backend/ocr-proxy`) y la app solo consume el endpoint.

### Para tus amigos (solo pull y correr)

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Iniciar app:

   ```bash
   npm run dev
   ```

Listo. Ya no necesitan `gcloud auth login` ni refrescar tokens localmente.

### Deploy backend (solo owner/admin, una sola vez o cuando cambie OCR)

1. Configura en tu `.env`:
- `EXPO_PUBLIC_GOOGLE_DOC_AI_PROJECT_ID`
- `EXPO_PUBLIC_GOOGLE_DOC_AI_LOCATION` (ej. `us`)
- `EXPO_PUBLIC_GOOGLE_DOC_AI_PROCESSOR_ID`

2. Despliega Cloud Run:

   ```bash
   npm run ocr:backend:deploy
   ```

Ese script:
- habilita APIs necesarias
- despliega `backend/ocr-proxy`
- configura permisos de Document AI al runtime service account
- actualiza `EXPO_PUBLIC_OCR_BACKEND_URL` en `.env` y `.env.example`
- deja `.env.example` listo para commitear y que todos consuman el endpoint nuevo
