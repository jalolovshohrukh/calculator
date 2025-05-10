import type { ApartmentCalcFormValues } from '@/lib/schema';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Phone, Mail, MapPin } from 'lucide-react';

interface PrintablePageProps {
  formData: ApartmentCalcFormValues;
  calculations: {
    totalPrice: number;
    discountApplied: number;
    discountPercentageVal: number;
    totalPriceAfterDiscount: number;
    downPaymentAmount: number;
    remainingAmount: number;
    monthlyInstallment: number;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export function PrintablePage({ formData, calculations }: PrintablePageProps) {
  return (
    <div id="printable-area" className="bg-card text-card-foreground shadow-lg print:shadow-none">
      <div className="w-[210mm] min-h-[297mm] p-[1cm] mx-auto flex flex-col space-y-6 text-sm">
        {/* Header */}
        <header className="flex justify-between items-center">
          <Logo className="text-primary h-8 w-8" />
          <h1 className="text-2xl font-bold text-primary">Apartment Quotation</h1>
        </header>
        <Separator />

        {/* Apartment Details */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Apartment Details</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <p><strong>Block:</strong> {formData.apartmentBlock}</p>
            <p><strong>Floor:</strong> {formData.floor}</p>
            <p><strong>Apartment No.:</strong> {formData.apartmentNumber}</p>
            <p><strong>Size:</strong> {formData.sizeSqMeters} sq. meters</p>
          </div>
        </section>
        <Separator />

        {/* Price Breakdown */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Price Breakdown</h2>
          <Card className="border-primary">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between"><span>Price per sq. meter:</span> <span>{formatCurrency(formData.pricePerSqMeter)}</span></div>
              <div className="flex justify-between"><span>Total Gross Price:</span> <span>{formatCurrency(calculations.totalPrice)}</span></div>
              {calculations.discountApplied > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount Applied ({calculations.discountPercentageVal}%):</span>
                  <span>- {formatCurrency(calculations.discountApplied)}</span>
                </div>
              )}
              <Separator/>
              <div className="flex justify-between font-semibold"><span>Total Net Price:</span> <span>{formatCurrency(calculations.totalPriceAfterDiscount)}</span></div>
            </CardContent>
          </Card>
        </section>
        

        {/* Payment Details */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Payment Plan</h2>
           <Card className="border-primary">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between">
                <span>Down Payment:</span>
                <span>
                  {formData.downPaymentType === 'percentage'
                    ? `${formData.downPaymentPercentage}% (${formatCurrency(calculations.downPaymentAmount)})`
                    : formatCurrency(calculations.downPaymentAmount)}
                </span>
              </div>
              <div className="flex justify-between"><span>Remaining Amount:</span> <span>{formatCurrency(calculations.remainingAmount)}</span></div>
              <Separator />
              <div className="flex justify-between"><span>Number of Installment Months:</span> <span>{formData.installmentMonths}</span></div>
              <div className="flex justify-between font-semibold"><span>Monthly Installment:</span> <span>{formatCurrency(calculations.monthlyInstallment)}</span></div>
            </CardContent>
          </Card>
        </section>
        
        <div className="flex-grow"></div> 

        {/* Footer */}
        <footer className="mt-auto pt-4 border-t border-border text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1 text-primary">Contact Information</h3>
              <div className="flex items-center space-x-2 mb-1">
                <Phone size={14} /> <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 mb-1">
                <Mail size={14} /> <span>contact@estatecalc.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={14} /> <span>123 Property Lane, Real Estate City, RC 12345</span>
              </div>
            </div>
            <div className="flex flex-col items-end justify-center">
              <QrCode size={64} data-ai-hint="company website" className="text-muted-foreground" />
              <p className="mt-1 text-muted-foreground">Scan for company website</p>
            </div>
          </div>
          <p className="text-center text-muted-foreground mt-4">Thank you for your interest! This quotation is valid for 30 days.</p>
        </footer>
      </div>
    </div>
  );
}
