'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import WithdrawalModal from './components/WithdrawalModal';
import WithdrawalHistoryModal from './components/WithdrawalHistoryModal';
import TopEarnersModal from './components/TopEarnersModal';
import RulesModal from './components/RulesModal';
import AboutModal from './components/AboutModal';
import LiveSupportModal from './components/LiveSupportModal';
import UserStats from './components/UserStats';
import DailyProgress from './components/DailyProgress';
import AdButtons from './components/AdButtons';
import DirectLinks from './components/DirectLinks';
import BottomNavigation from './components/BottomNavigation';
import Loading from './components/Loading';
import ErrorFallback from './components/ErrorFallback';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { fetchUserState, fetchDirectLinks, watchAd } from './store';
import { useRouter } from 'next/navigation';
import { useTheme } from './providers/ThemeProvider';
import { useModals } from './hooks/useModals';

interface Session {
    user?: {
        id?: string;
        name?: string;
        email?: string;
    };
}

declare global {
    interface Window {
        show_9132294: any;
        Telegram: {
            WebApp: {
                initData: string;
                initDataUnsafe: {
                    user?: {
                        id: number;
                        username?: string;
                        first_name?: string;
                        last_name?: string;
                    };
                };
            };
        };
    }
}

export default function Home() {
    const dispatch = useDispatch<AppDispatch>();
    const userState = useSelector((state: RootState) => state.userStats.userState);
    const adState = useSelector((state: RootState) => state.ad);
    const [telegramUser, setTelegramUser] = useState<{id: number, username?: string} | null>(null);
    
    const {
      isWithdrawalModalOpen,
      isHistoryModalOpen,
      isTopEarnersModalOpen,
      isRulesModalOpen,
      isAboutModalOpen,
      isLiveSupportModalOpen,
      setIsWithdrawalModalOpen,
      setIsHistoryModalOpen,
      setIsTopEarnersModalOpen,
      setIsRulesModalOpen,
      setIsAboutModalOpen,
      setIsLiveSupportModalOpen
    } = useModals();

    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const initializeApp = async () => {
            try {
                const isTelegramMiniApp = window.Telegram?.WebApp;
                
                if (isTelegramMiniApp) {
                    const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
                    if (tgUser) {
                        setTelegramUser({
                            id: tgUser.id,
                            username: tgUser.username
                        });
                        
                        await Promise.all([
                            dispatch(fetchUserState({ telegramId: tgUser.id.toString() })),
                            dispatch(fetchDirectLinks('adult'))
                        ]);
                        return;
                    }
                }

               dispatch(fetchUserState({ telegramId: '709148502' }));
            } catch (error) {
                console.error('Failed to initialize app:', error);
            }
        };

        initializeApp();
    }, [dispatch]);

    useEffect(() =>{
        if(theme === 'light'){
            toggleTheme()
        }
    }, [toggleTheme])

    const handleWatchAd = async () => {
        if (!telegramUser) {
            alert('Please login first');
            return;
        }

        try {
            await window.show_9132294?.();
            const resultAction = await dispatch(watchAd({ telegramId: telegramUser.id.toString() }));
            
            if (watchAd.fulfilled.match(resultAction)) {
                await dispatch(fetchUserState({ telegramId: telegramUser.id.toString() }));
            } else if (watchAd.rejected.match(resultAction)) {
                throw new Error(resultAction.payload as string);
            }
        } catch (err) {
            console.error('Error watching ad:', err);
            alert(err instanceof Error ? err.message : 'Failed to watch ad');
        }
    };

    if (userState.loading || adState.loading) {
        return <Loading />;
    }

    if (userState.error || adState.error) {
        return (
            <ErrorFallback 
                error={userState.error || adState.error || 'An error occurred'} 
                onRetry={() => window.location.reload()  } 
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Top Navigation with Marquee */}
            <nav className="fixed top-0 left-0 right-0 z-50 gradient-flow shadow-lg border-b border-gray-700">
                <div className="relative py-1.5 sm:py-2 px-3 sm:px-4 overflow-hidden bg-black/30 backdrop-blur-sm">
                    <div className="flex whitespace-nowrap animate-marquee">
                        <span className="text-white font-bold text-xs sm:text-base mx-2 sm:mx-4 flex items-center">
                            <span className="inline-block animate-bounce mr-1.5 sm:mr-2 text-sm sm:text-base">🎉</span>
                            Welcome to my bot! Watch ads and earn rewards!
                        </span>
                        <span className="text-white font-bold text-xs sm:text-base mx-2 sm:mx-4 flex items-center">
                            <span className="inline-block animate-bounce mr-1.5 sm:mr-2 text-sm sm:text-base">🎉</span>
                            Welcome to my bot! Watch ads and earn rewards!
                        </span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-20 max-w-4xl">
                <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white rgb-animate py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg text-center leading-tight">
                        Watch Ads & Earn Money
                    </h1>
                    <UserStats />

                    <DailyProgress
                        adsWatched={userState.adsWatched}
                        maxAds={1000}
                    />

                    <AdButtons
                        onWatchAd={handleWatchAd}
                        disabled={false}
                    />

                    <DirectLinks />
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation
                onWithdraw={() => setIsWithdrawalModalOpen(true)}
                onTopEarners={() => setIsTopEarnersModalOpen(true)}
                onRules={() => setIsRulesModalOpen(true)}
                onAbout={() => setIsAboutModalOpen(true)}
                onSupport={() => setIsLiveSupportModalOpen(true)}
            />

            {/* Modals */}
            <WithdrawalModal
                isOpen={isWithdrawalModalOpen}
                onClose={() => setIsWithdrawalModalOpen(false)}
                telegramId={telegramUser?.id.toString() || '709148502'}
                onHistoryClick={() => {
                    setIsWithdrawalModalOpen(false);
                    setIsHistoryModalOpen(true);
                }}
            />
            <WithdrawalHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                telegramId={telegramUser?.id.toString() || '709148502'}
            />
            <TopEarnersModal
                isOpen={isTopEarnersModalOpen}
                onClose={() => setIsTopEarnersModalOpen(false)}
            />
            <RulesModal
                isOpen={isRulesModalOpen}
                onClose={() => setIsRulesModalOpen(false)}
            />
            <AboutModal
                isOpen={isAboutModalOpen}
                onClose={() => setIsAboutModalOpen(false)}
            />
            <LiveSupportModal
                isOpen={isLiveSupportModalOpen}
                onClose={() => setIsLiveSupportModalOpen(false)}
                userId={telegramUser?.id.toString() || '709148502'}
                userName={telegramUser?.username || 'jibon'}
            />
        </div>
    );
}
