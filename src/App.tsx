import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider, useApp } from "@/contexts/AppContext";
import SplashScreen from "@/components/screens/SplashScreen";
import LanguageScreen from "@/components/screens/LanguageScreen";
import HomeScreen from "@/components/screens/HomeScreen";
import CropSelectScreen from "@/components/screens/CropSelectScreen";
import CameraScreen from "@/components/screens/CameraScreen";
import AnalyzingScreen from "@/components/screens/AnalyzingScreen";
import ResultScreen from "@/components/screens/ResultScreen";
import AdvisoryScreen from "@/components/screens/AdvisoryScreen";
import FeedbackScreen from "@/components/screens/FeedbackScreen";
import PopScreen from "@/components/screens/PopScreen";
import LoginScreen from "@/components/screens/LoginScreen";
import NewsScreen from "@/components/screens/NewsScreen";
import AdminNewsScreen from "@/components/screens/AdminNewsScreen";
import WeatherScreen from "@/components/screens/WeatherScreen";
import MandiScreen from "@/components/screens/MandiScreen";
import CalculatorScreen from "@/components/screens/CalculatorScreen";
import ShopScreen from "@/components/screens/ShopScreen";
import SchemesScreen from "@/components/screens/SchemesScreen";
import VarietiesScreen from "@/components/screens/VarietiesScreen";
import ProfitBoosterScreen from "@/components/screens/ProfitBoosterScreen";
import FinanceScreen from "@/components/screens/FinanceScreen";
import VoiceChatbot from "@/components/VoiceChatbot";

const queryClient = new QueryClient();

const AppContent = () => {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'language':
        return <LanguageScreen />;
      case 'home':
        return <HomeScreen />;
      case 'cropSelect':
        return <CropSelectScreen />;
      case 'camera':
        return <CameraScreen />;
      case 'analyzing':
        return <AnalyzingScreen />;
      case 'result':
        return <ResultScreen />;
      case 'advisory':
        return <AdvisoryScreen />;
      case 'feedback':
        return <FeedbackScreen />;
      case 'pop':
        return <PopScreen />;
      case 'login':
        return <LoginScreen />;
      case 'news':
        return <NewsScreen />;
      case 'adminNews':
        return <AdminNewsScreen />;
      case 'weather':
        return <WeatherScreen />;
      case 'mandi':
        return <MandiScreen />;
      case 'calculator':
        return <CalculatorScreen />;
      case 'shop':
        return <ShopScreen />;
      case 'schemes':
        return <SchemesScreen />;
      case 'varieties':
        return <VarietiesScreen />;
      case 'profitBooster':
        return <ProfitBoosterScreen />;
      case 'finance':
        return <FinanceScreen />;
      default:
        return <SplashScreen />;
    }
  };

  const showBot = !['splash', 'language', 'camera', 'analyzing'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-background font-hindi">
      {renderScreen()}
      {showBot && <VoiceChatbot />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
