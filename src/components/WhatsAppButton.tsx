'use client';

import { Button } from '@/components/ui/Button';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface WhatsAppButtonProps {
    productName: string;
}

export default function WhatsAppButton({ productName }: WhatsAppButtonProps) {
    // You can update this phone number as needed
    const phoneNumber = '923172240910';

    const handleWhatsAppRedirect = () => {
        const productUrl = typeof window !== 'undefined' ? window.location.href : '';
        const message = `I want this product: ${productName}\n${productUrl}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <Button
                onClick={handleWhatsAppRedirect}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-7 rounded-2xl flex items-center justify-center gap-3 group transition-all active:scale-[0.98] shadow-xl shadow-green-900/10 border-none"
            >
                <div className="relative">
                    <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white/20"></span>
                    </span>
                </div>
                <div className="flex flex-col items-start leading-none">
                    <span className="text-xs opacity-80 font-medium mb-0.5 uppercase tracking-wider">Quick Order</span>
                    <span className="text-lg">Order via WhatsApp</span>
                </div>
            </Button>
        </motion.div>
    );
}
