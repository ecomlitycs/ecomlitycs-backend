import React from 'react';
import { CloseIcon, SpinnerIcon, StoreIcon } from './icons';

interface ShopifyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: () => void;
    isConnecting: boolean;
}

const ShopifyModal: React.FC<ShopifyModalProps> = ({ isOpen, onClose, onConnect, isConnecting }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Conectar com Shopify</h2>
                     <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-card-alt">
                        <CloseIcon />
                    </button>
                </div>
                 <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mb-4">
                        <StoreIcon className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground mb-6">
                        Você será redirecionado para a Shopify para autorizar a conexão. Isso permitirá a sincronização automática de seus produtos e dados de vendas.
                    </p>
                    <button 
                        onClick={onConnect}
                        disabled={isConnecting}
                        className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg text-base hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isConnecting && <SpinnerIcon className="w-5 h-5" />}
                        <span>{isConnecting ? 'Conectando...' : 'Ir para Shopify'}</span>
                    </button>
                </div>
                 <style>{`
                    @keyframes fade-in-up {
                        0% {
                            opacity: 0;
                            transform: translateY(20px) scale(0.98);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                    .animate-fade-in-up {
                        animation: fade-in-up 0.3s ease-out forwards;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ShopifyModal;