import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const MortgageCalculator = ({ propertyPrice, currency = 'TRY' }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTerm, setLoanTerm] = useState(120); // months
  const [interestRate, setInterestRate] = useState(2.5); // monthly rate
  const [result, setResult] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR').format(Math.round(price));
  };

  useEffect(() => {
    calculateMortgage();
  }, [propertyPrice, downPaymentPercent, loanTerm, interestRate]);

  const calculateMortgage = () => {
    const downPayment = (propertyPrice * downPaymentPercent) / 100;
    const loanAmount = propertyPrice - downPayment;
    const monthlyRate = interestRate / 100;
    
    // Aylık taksit formülü: P * r * (1+r)^n / ((1+r)^n - 1)
    const numerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm);
    const denominator = Math.pow(1 + monthlyRate, loanTerm) - 1;
    const monthlyPayment = numerator / denominator;
    
    const totalPayment = monthlyPayment * loanTerm;
    const totalInterest = totalPayment - loanAmount;

    setResult({
      downPayment,
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏦</span>
          <span className="font-semibold text-lg">{t('mortgage.title', 'Kredi Hesaplayıcı')}</span>
        </div>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-6">
          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            {/* Down Payment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('mortgage.downPayment', 'Peşinat')} ({downPaymentPercent}%)
              </label>
              <input
                type="range"
                min="5"
                max="95"
                step="5"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>%5</span>
                <span className="font-medium text-blue-600">
                  {formatPrice((propertyPrice * downPaymentPercent) / 100)} {currency}
                </span>
                <span>%95</span>
              </div>
            </div>

            {/* Loan Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('mortgage.loanTerm', 'Vade Süresi')} ({Math.floor(loanTerm / 12)} yıl / {loanTerm} ay)
              </label>
              <input
                type="range"
                min="12"
                max="180"
                step="12"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 yıl</span>
                <span>15 yıl</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('mortgage.interestRate', 'Aylık Faiz Oranı')} (%{interestRate.toFixed(2)})
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>%1</span>
                <span>%5</span>
              </div>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">{t('mortgage.downPaymentAmount', 'Peşinat Tutarı')}</div>
                  <div className="text-xl font-bold text-gray-800">
                    {formatPrice(result.downPayment)} {currency}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">{t('mortgage.loanAmount', 'Kredi Tutarı')}</div>
                  <div className="text-xl font-bold text-gray-800">
                    {formatPrice(result.loanAmount)} {currency}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 text-center mb-4">
                <div className="text-sm text-blue-600 mb-1">{t('mortgage.monthlyPayment', 'Aylık Taksit')}</div>
                <div className="text-4xl font-bold text-blue-700">
                  {formatPrice(result.monthlyPayment)} {currency}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">{t('mortgage.totalPayment', 'Toplam Ödeme')}</span>
                  <span className="font-semibold">{formatPrice(result.totalPayment)} {currency}</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded">
                  <span className="text-gray-600">{t('mortgage.totalInterest', 'Toplam Faiz')}</span>
                  <span className="font-semibold text-red-600">{formatPrice(result.totalInterest)} {currency}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                ⚠️ {t('mortgage.disclaimer', 'Bu hesaplama tahminidir. Gerçek kredi şartları bankalara göre değişiklik gösterebilir.')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MortgageCalculator;
