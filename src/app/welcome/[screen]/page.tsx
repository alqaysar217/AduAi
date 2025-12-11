
'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext'; // Import useLanguage
import { cn } from '@/lib/utils'; // Import cn utility

const welcomeScreensData = [
  {
    titleKey: 'welcome.screen1Title',
    descriptionKey: 'welcome.screen1Desc',
    nextPath: '/welcome/2',
    showSignup: false,
    imageHint: "friendly robot wave",
  },
  {
    titleKey: 'welcome.screen2Title',
    descriptionKey: 'welcome.screen2Desc',
    nextPath: '/welcome/3',
    showSignup: false,
    imageHint: "robot tools presentation",
  },
  {
    titleKey: 'welcome.screen3Title',
    descriptionKey: 'welcome.screen3Desc',
    nextPath: '/signup', // This might be login or signup based on buttons
    showSignup: true,
    imageHint: "excited robot thumbs up",
  },
];

export default function WelcomeScreen() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage(); // Use language context
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Logic to check if onboarding should be skipped (e.g., if already completed)
    // For this implementation, welcome screens always show as per latest user requests.
    // const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
    // if (onboardingCompleted) {
    //   router.replace('/login');
    // }
  }, [router]);

  const screenNumber = parseInt(params.screen as string, 10);

  useEffect(() => {
    if (isNaN(screenNumber) || screenNumber < 1 || screenNumber > welcomeScreensData.length) {
      router.replace('/welcome/1');
    } else {
      setIsLoading(false);
    }
  }, [screenNumber, router]);

  if (isLoading || isNaN(screenNumber) || screenNumber < 1 || screenNumber > welcomeScreensData.length) {
    return <div className="flex min-h-screen items-center justify-center p-4"><p>{t('splash.loading', { progress: '...' })}</p></div>;
  }

  const currentScreenIndex = screenNumber - 1;
  const screenData = welcomeScreensData[currentScreenIndex];
  const progressValue = (screenNumber / welcomeScreensData.length) * 100;

  const handleNext = () => {
    router.push(screenData.nextPath);
  };

  const handleSignUp = () => {
    // localStorage.setItem('onboardingCompleted', 'true'); // Not needed as per current flow
    router.push('/signup');
  };

  const handleLogin = () => {
    // localStorage.setItem('onboardingCompleted', 'true'); // Not needed
    router.push('/login');
  };

  const handleSkip = () => {
    // localStorage.setItem('onboardingCompleted', 'true'); // Not needed
    router.push('/login');
  };

  const handleBack = () => {
    if (screenNumber > 1) {
      router.push(`/welcome/${screenNumber - 1}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-background relative">
      {screenNumber > 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 rtl:right-4 ltr:left-4 text-muted-foreground hover:text-primary z-10 h-10 w-10"
          aria-label={t('buttons.back')}
        >
          <ArrowLeft className={cn(language === 'ar' && 'transform scale-x-[-1]')} />
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={handleSkip}
        className="absolute top-4 rtl:left-4 ltr:right-4 text-muted-foreground hover:text-primary z-10"
      >
        {t('buttons.skip')}
      </Button>

      <Progress value={progressValue} className="w-full max-w-sm mb-6 h-1 absolute top-0 left-0 right-0 mx-auto mt-2" />

      <Card className="w-full max-w-sm text-center card-base mt-12">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-6 flex items-center justify-center h-24 w-24">
            <AppLogo className="h-20 w-20 text-primary" data-ai-hint={screenData.imageHint} />
          </div>
          <CardTitle className="text-2xl font-heading mb-2">{t(screenData.titleKey)}</CardTitle>
          <CardDescription>{t(screenData.descriptionKey)}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Content can be added here if needed per screen */}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-6">
          <div className="flex w-full space-x-4 rtl:space-x-reverse">
            {screenData.showSignup ? (
              <>
                <Button onClick={handleSignUp} className="flex-1 btn-base">{t('buttons.signup')}</Button>
                <Button variant="outline" onClick={handleLogin} className="flex-1 btn-base">{t('buttons.login')}</Button>
              </>
            ) : (
              <>
                <Button onClick={handleNext} className="flex-1 btn-base">{t('buttons.next')}</Button>
                <Button variant="outline" onClick={handleLogin} className="flex-1 btn-base">{t('buttons.login')}</Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>

      <div className="mt-6 text-sm text-muted-foreground">
        {screenNumber} / {welcomeScreensData.length}
      </div>
    </div>
  );
}
