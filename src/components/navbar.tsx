"use client";

import { ConnectButton, darkTheme, lightTheme, useActiveAccount } from "thirdweb/react";
import { client } from "@/app/client";
import { sepolia } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";

export function Navbar() {
    const account = useActiveAccount();
    const [isClaimLoading, setIsClaimLoading] = useState(false);
    const { toast } = useToast();
    const { theme, systemTheme } = useTheme();
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Handle system theme preference
        const resolvedTheme = theme === 'system' ? systemTheme : theme;
        setCurrentTheme(resolvedTheme as 'light' | 'dark');
    }, [theme, systemTheme]);

    const handleClaimTokens = async () => {
        setIsClaimLoading(true);
        try {
            const resp = await fetch("/api/claimToken", {
                method: "POST",
                body: JSON.stringify({ address: account?.address }),
            });
            
            if (!resp.ok) {
                throw new Error('Failed to claim tokens');
            }

            toast({
                title: "Tokens Claimed!",
                description: "Your tokens have been successfully claimed.",
                duration: 5000,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Claim Failed",
                description: "There was an error claiming your tokens. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsClaimLoading(false);
        }
    };
    
    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Decentralized Prediction Market</h1>
            <div className="items-center flex gap-2">
                <ThemeToggle />
                {account && (
                    <Button 
                        onClick={handleClaimTokens}
                        disabled={isClaimLoading}
                        variant="outline"
                    >
                        {isClaimLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Claiming...
                            </>
                        ) : (
                            'Claim Tokens'
                        )}
                    </Button>
                )}
                <ConnectButton 
                    client={client} 
                    theme={currentTheme === 'dark' ? darkTheme() : lightTheme()}
                    chain={sepolia}
                    connectButton={{
                        style: {
                            fontSize: '0.75rem !important',
                            height: '2.5rem !important',
                        },
                        label: 'Sign In',
                    }}
                    detailsButton={{
                        displayBalanceToken: {
                            [sepolia.id]: "0x99019DC00929941e4d0fd4f1d556D1fF9F08b0A4"
                        }
                    }}
                    wallets={[
                        inAppWallet(),
                    ]}
                    accountAbstraction={{
                        chain: sepolia,
                        sponsorGas: true,
                    }}
                />
            </div>
        </div>
    );
}
