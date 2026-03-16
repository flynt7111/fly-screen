interface FlyScreenAPI {
  exitApp: () => Promise<void>;
}

interface Window {
  flyScreen: FlyScreenAPI;
}
