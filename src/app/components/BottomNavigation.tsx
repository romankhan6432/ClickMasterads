'use client';

interface BottomNavigationProps {
    onWithdraw: () => void;
    onTopEarners: () => void;
    onRules: () => void;
    onAbout: () => void;
    onSupport: () => void;
}

export default function BottomNavigation({
    onWithdraw,
    onTopEarners,
    onRules,
    onAbout,
    onSupport
}: BottomNavigationProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50 shadow-2xl pb-safe md:hidden">
            <div className="max-w-screen-xl mx-auto px-2 sm:px-4">
                <div className="flex justify-around items-center py-2 sm:py-3 gap-1">
                    <NavButton icon="💰" label="Withdraw" onClick={onWithdraw} />
                    <NavButton icon="👑" label="Top Users" onClick={onTopEarners} />
                    <NavButton icon="📜" label="Rules" onClick={onRules} />
                    <NavButton icon="ℹ️" label="About" onClick={onAbout} />
                    <NavButton icon="💬" label="Support" onClick={onSupport} />
                </div>
            </div>
        </nav>
    );
}

interface NavButtonProps {
    icon: string;
    label: string;
    onClick: () => void;
}

function NavButton({ icon, label, onClick }: NavButtonProps) {
    return (
        <button 
            onClick={onClick}
            className="group flex flex-col items-center justify-center min-w-[60px] min-h-[56px] px-2 py-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 hover:from-violet-700 hover:to-purple-900 active:scale-95 active:from-violet-800 active:to-purple-900 transition-all duration-200 ease-out shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
            <span className="text-xl mb-1 group-active:scale-90 transition-transform duration-200">
                {icon}
            </span>
            <span className="text-[10px] font-semibold tracking-wide group-active:scale-95 transition-transform duration-200">
                {label}
            </span>
        </button>
    );
}
