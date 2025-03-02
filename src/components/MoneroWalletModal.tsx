
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useSavings } from '@/context/SavingsContext';
import { formatCurrency } from '@/lib/savingsUtils';

interface MoneroWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

const MoneroWalletModal: React.FC<MoneroWalletModalProps> = ({ isOpen, onClose, amount }) => {
  const { completePayment } = useSavings();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [showAddressInput, setShowAddressInput] = useState<boolean>(true);
  
  // Load saved wallet address from localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem('moneroWalletAddress');
    if (savedAddress) {
      setWalletAddress(savedAddress);
      setShowAddressInput(false);
    }
  }, []);
  
  // Placeholder conversion rate - in a production app this would come from an API
  const xmrRate = 0.005; // USD to XMR (fictional rate for example)
  const amountInXMR = (amount * xmrRate).toFixed(6);

  const handleSaveAddress = () => {
    if (!walletAddress.trim()) {
      toast.error("Please enter your Monero wallet address");
      return;
    }
    
    // Save to localStorage for future use
    localStorage.setItem('moneroWalletAddress', walletAddress);
    
    setShowAddressInput(false);
    toast.success("Wallet address saved");
  };

  const handlePaymentConfirmation = () => {
    // In a real app, you might implement a way to verify the transaction
    // For now, we trust the user confirmation
    completePayment();
    onClose();
    toast.success(`Payment of ${formatCurrency(amount)} confirmed!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 mx-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-[#654321] mb-4">Monero Payment</h2>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-[#f5f6fa] rounded-lg">
            <p className="text-lg font-semibold">{formatCurrency(amount)}</p>
            <p className="text-sm text-gray-500">≈ {amountInXMR} XMR</p>
          </div>

          {showAddressInput ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Monero Wallet Address
                </label>
                <input
                  id="walletAddress"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#654321]"
                  placeholder="Enter your Monero address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
                <p className="mt-2 text-xs text-gray-500">
                  This is the address where you want to receive payments.
                </p>
              </div>
              <button
                onClick={handleSaveAddress}
                className="w-full bg-[#654321] text-white px-4 py-2 rounded-md hover:bg-[#7c5a3c] transition-colors"
              >
                Save Address
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Send {amountInXMR} XMR to this address:
                </p>
                <div className="bg-gray-100 p-3 rounded-md overflow-hidden text-xs break-all">
                  {walletAddress}
                </div>
              </div>
              
              <div className="flex justify-center my-4">
                <div className="p-3 bg-white rounded-md border">
                  <QRCodeSVG value={`monero:${walletAddress}?tx_amount=${amountInXMR}`} size={180} />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  After sending the payment from your Monero wallet, click the button below to confirm.
                </p>
                <button
                  onClick={handlePaymentConfirmation}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  I've Sent the Payment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoneroWalletModal;
