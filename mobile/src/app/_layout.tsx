import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { ReportProvider } from '@/components/report-context';

export default function TabLayout() {
  return (
    <ReportProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </ReportProvider>
  );
}
