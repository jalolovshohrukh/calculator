
import type { ApartmentCalcFormValues } from '@/lib/schema';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
  // Use Intl.NumberFormat with a fixed locale and currency to ensure consistent formatting
  // between server and client. Using 'en-US' with 'UZS' to get the desired "UZS 500" format.
  // Adjust locale if a different format is needed, but keep it consistent.
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

export function PrintablePage({ formData, calculations }: PrintablePageProps) {
  return (
    <div id="printable-area" className="bg-card text-card-foreground shadow-lg print:shadow-none">
      <div className="w-[190mm] min-h-[300mm] p-[2cm] mx-auto flex flex-col space-y-6 text-sm">
        {/* Header */}
        <header className="flex justify-between items-center">
          <Logo className="text-primary h-8 w-8" />
          <h1 className="text-2xl font-bold text-primary">Kvartira Narxnomasi</h1>
        </header>
        <Separator />

        {/* Apartment Details */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Kvartira Tafsilotlari</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <p><strong>Blok:</strong> {formData.apartmentBlock}</p>
            <p><strong>Qavat:</strong> {formData.floor}</p>
            <p><strong>Kvartira Raqami:</strong> {formData.apartmentNumber}</p>
            <p><strong>Xonalar Soni:</strong> {formData.numberOfRooms}</p>
            <p><strong>Hajmi:</strong> {formData.sizeSqMeters} kv. metr</p>
          </div>
        </section>
        <Separator />

        {/* Price Breakdown */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Narxlar Tahlili</h2>
          <Card className="border-primary">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between"><span>Bir kv. metr narxi:</span> <span>{formatCurrency(formData.pricePerSqMeter)}</span></div>
              <div className="flex justify-between"><span>Jami Yalpi Narx:</span> <span>{formatCurrency(calculations.totalPrice)}</span></div>
              {calculations.discountApplied > 0 && (
                <div className="flex justify-between text-success">
                  <span>Qo'llanilgan Chegirma ({calculations.discountPercentageVal}%):</span>
                  <span>- {formatCurrency(calculations.discountApplied)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold"><span>Jami Sof Narx:</span> <span>{formatCurrency(calculations.totalPriceAfterDiscount)}</span></div>
            </CardContent>
          </Card>
        </section>


        {/* Payment Details */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">To'lov Rejasi</h2>
          <Card className="border-primary">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between">
                <span>Boshlang'ich To'lov:</span>
                <span>
                  {formData.downPaymentType === 'percentage'
                    ? `${formData.downPaymentPercentage}% (${formatCurrency(calculations.downPaymentAmount)})`
                    : formatCurrency(calculations.downPaymentAmount)}
                </span>
              </div>
              <div className="flex justify-between"><span>Qolgan Miqdor:</span> <span>{formatCurrency(calculations.remainingAmount)}</span></div>
              <Separator />
              <div className="flex justify-between"><span>Bo'lib To'lash Oylari Soni:</span> <span>{formData.installmentMonths}</span></div>
              <div className="flex justify-between font-semibold"><span>Oylik To'lov:</span> <span>{formatCurrency(calculations.monthlyInstallment)}</span></div>
            </CardContent>
          </Card>
        </section>

        <div className="flex-grow"></div>

        {/* Footer */}
        <footer className="mt-auto pt-4 border-t border-border text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1 text-primary">Aloqa Ma'lumotlari</h3>
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
                fgColor="#0f5906"       // Foreground (QR code) color - example: Tailwind's blue-800
              />
              <p className="mt-1 text-muted-foreground">Kompaniya veb-sayti uchun skanerlang</p>
            </div>

          </div>
          <p className="text-center text-muted-foreground mt-4"></p>
        </footer>
      </div>
    </div>
  );
}
