'use client';

import { useState, useEffect } from 'react';
import WithdrawalModal from './components/WithdrawalModal';
import WithdrawalHistoryModal from './components/WithdrawalHistoryModal';
import TopEarnersModal from './components/TopEarnersModal';
import RulesModal from './components/RulesModal';
import AboutModal from './components/AboutModal';
import LiveSupportModal from './components/LiveSupportModal';
import UserStats from './components/UserStats';
import DailyProgress from './components/DailyProgress';
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
import { toast } from 'react-toastify';
import { DEMO_USER_ID } from '@/lib/defult_user';



declare global {
    interface Window {
        show_9103912: any;
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
    const [autoShowAds, setAutoShowAds] = useState(false);
    const [countdown, setCountdown] = useState(5);
    
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

               //dispatch(fetchUserState({ telegramId: DEMO_USER_ID }));
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

    useEffect(() => {
        let timer: NodeJS.Timeout;
        
        if (autoShowAds && !adState.loading) {
            if (countdown > 0) {
                timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
            } else {
                const showAd = async () => {
                    try {
                        await window.show_9103912?.();
                        const resultAction = await dispatch(watchAd({ telegramId: telegramUser?.id.toString() || DEMO_USER_ID || '' }));
                        
                        if (watchAd.fulfilled.match(resultAction)) {
                            dispatch(fetchUserState({ telegramId: telegramUser?.id.toString() || DEMO_USER_ID }));
                            setCountdown(5); // Reset countdown after successful ad view
                        } else if (watchAd.rejected.match(resultAction)) {
                            setAutoShowAds(false);
                            throw new Error(resultAction.payload as string);
                        }
                    } catch (err) {
                        setAutoShowAds(false);
                        console.error('Error watching ad:', err);
                        toast.error(err instanceof Error ? err.message : 'Failed to watch ad');
                    }
                };
                
                showAd();
            }
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [autoShowAds, countdown, adState.loading, dispatch, telegramUser]);

    const handleWatchAd = async () => {
        try {
            await window.show_9103912?.();
            
            const resultAction = await dispatch(watchAd({ telegramId: telegramUser?.id.toString() ||   DEMO_USER_ID || '' }));
            
            if (watchAd.fulfilled.match(resultAction)) {
                dispatch(fetchUserState({ telegramId: telegramUser?.id.toString() ||   DEMO_USER_ID }));
            } else if (watchAd.rejected.match(resultAction)) {
                setAutoShowAds(false);
                throw new Error(resultAction.payload as string);
            }
        } catch (err) {
            setAutoShowAds(false);
            console.error('Error watching ad:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to watch ad');
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

                    {/* Watch Ads Button */}
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={handleWatchAd}
                            disabled={adState.loading}
                            className="relative overflow-hidden group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-all duration-300"></div>
                            <div className="flex items-center space-x-2">
                                <span className="text-xl">🎥</span>
                                <span className="text-lg">
                                    {adState.loading ? 'Loading...' : 'Watch Ad to Earn'}
                                </span>
                            </div>
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setAutoShowAds(!autoShowAds);
                                    setCountdown(5);
                                }}
                                className={`px-4 py-2 rounded-lg font-medium ${
                                    autoShowAds 
                                    ? 'bg-red-500 hover:bg-red-600' 
                                    : 'bg-green-500 hover:bg-green-600'
                                } transition-colors duration-300`}
                            >
                                {autoShowAds ? 'Stop Auto Ads' : 'Start Auto Ads'}
                            </button>
                            {autoShowAds && !adState.loading && (
                                <span className="text-sm text-gray-300">
                                    Next ad in: {countdown}s
                                </span>
                            )}
                        </div>
                    </div>

                    <DirectLinks  telegramId={ telegramUser?.id.toString() } />
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
