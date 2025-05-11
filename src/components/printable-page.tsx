
import type { ApartmentCalcFormValues } from '@/lib/schema';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useI18n } from '@/lib/i18n'; 

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

export function PrintablePage({ formData, calculations }: PrintablePageProps) {
  const { t, formatCurrency, currency } = useI18n(); 

  return (
    <div id="printable-area" className="bg-card text-card-foreground shadow-lg print:shadow-none">
      <div className="w-[190mm] min-h-[300mm] p-[2cm] mx-auto flex flex-col space-y-6 text-sm">
        <header className="flex justify-between items-center">
          <Logo className="text-primary h-8 w-8" />
          <h1 className="text-2xl font-semibold text-primary">{t('quotationTitle')}</h1>
        </header>
        <Separator />

        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">{t('apartmentDetailsTitle')}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <p><strong>{t('blockLabel')}:</strong> {formData.apartmentBlock}</p>
            <p><strong>{t('floorLabel')}:</strong> {formData.floor}</p>
            <p><strong>{t('apartmentNumberPrintLabel')}:</strong> {formData.apartmentNumber}</p>
            <p><strong>{t('numberOfRoomsPrintLabel')}:</strong> {formData.numberOfRooms}</p>
            <p><strong>{t('sizePrintLabel')}:</strong> {formData.sizeSqMeters} {t('sizeUnitSqMeters')}</p>
          </div>
        </section>
        <Separator />

        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">{t('priceAnalysisTitle')}</h2>
          <Card className="border-primary">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between"><span>{t('pricePerSqMeterPrintLabel')} ({currency}):</span> <span>{formatCurrency(formData.pricePerSqMeter, currency)}</span></div>
              <div className="flex justify-between"><span>{t('totalGrossPriceLabel')} ({currency}):</span> <span>{formatCurrency(calculations.totalPrice, currency)}</span></div>
              {calculations.discountApplied > 0 && (
                <div className="flex justify-between text-success">
                  <span>{t('discountAppliedLabel')} ({calculations.discountPercentageVal}%):</span>
                  <span>- {formatCurrency(calculations.discountApplied, currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold"><span>{t('totalNetPriceLabel')} ({currency}):</span> <span>{formatCurrency(calculations.totalPriceAfterDiscount, currency)}</span></div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">{t('paymentPlanTitle')}</h2>
          <Card className="border-primary">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between">
                <span>{t('downPaymentPrintLabel')} ({currency}):</span>
                <span>
                  {formData.downPaymentType === 'percentage'
                    ? `${formData.downPaymentPercentage}% (${formatCurrency(calculations.downPaymentAmount, currency)})`
                    : formatCurrency(calculations.downPaymentAmount, currency)}
                </span>
              </div>
              <div className="flex justify-between"><span>{t('remainingAmountLabel')} ({currency}):</span> <span>{formatCurrency(calculations.remainingAmount, currency)}</span></div>
              <Separator />
              <div className="flex justify-between"><span>{t('installmentMonthsPrintLabel')}:</span> <span>{formData.installmentMonths}</span></div>
              <div className="flex justify-between font-semibold"><span>{t('monthlyInstallmentLabel')} ({currency}):</span> <span>{formatCurrency(calculations.monthlyInstallment, currency)}</span></div>
            </CardContent>
          </Card>
        </section>

        <div className="flex-grow"></div>

        <footer className="mt-auto pt-4 border-t border-border text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1 text-primary">{t('contactInfoTitle')}</h3>
              <div className="flex items-center space-x-2 mb-1">
                <Phone size={14} /> <span>+998 94 504 80 80</span>
              </div>
              <div className="flex items-center space-x-2 mb-1">
                <Mail size={14} /> <span>citypark.uz@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={14} /> <span>Denov, Sharof Rashidov ko'chasi, 261B</span>
              </div>
            </div>
            <div className="flex flex-col items-end justify-center">
              <QRCodeSVG
                value="https://cityparkdenou.vercel.app"
                width={64}
                height={64}
                className="rounded"
                fgColor="#0f5906" 
              />
              <p className="mt-1 text-muted-foreground">{t('scanForWebsiteText')}</p>
            </div>
          </div>
          <p className="text-center text-muted-foreground mt-4"></p>
        </footer>
      </div>
    </div>
  );
}
