
"use client";

import type { ApartmentCalcFormValues } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form'; 
import { apartmentCalcSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PrintablePage } from '@/components/printable-page';
import { Separator } from '@/components/ui/separator';
import { Building, Layers, DoorOpen, Square, CircleDollarSign, Landmark, CalendarDays, Printer, BedDouble } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useI18n } from '@/lib/i18n'; 
import { LanguageSwitcher } from './language-switcher'; 
import { CurrencySwitcher } from './currency-switcher';


const initialCalculations = {
  totalPrice: 0,
  discountApplied: 0,
  discountPercentageVal: 0,
  totalPriceAfterDiscount: 0,
  downPaymentAmount: 0,
  remainingAmount: 0,
  monthlyInstallment: 0,
};

export function EstateCalcForm() {
  const { t, locale, currency } = useI18n(); 
  const form = useForm<ApartmentCalcFormValues>({
    resolver: zodResolver(apartmentCalcSchema), 
    defaultValues: {
      apartmentBlock: 'A1',
      floor: 1,
      apartmentNumber: 101,
      sizeSqMeters: 80,
      pricePerSqMeter: 5000000, 
      numberOfRooms: 3,
      downPaymentType: 'percentage',
      downPaymentPercentage: 30,
      installmentMonths: 12,
    },
  });

  const [calculations, setCalculations] = useState(initialCalculations);

  const sizeSqMeters = form.watch("sizeSqMeters");
  const pricePerSqMeter = form.watch("pricePerSqMeter");
  const watchedDownPaymentType = form.watch("downPaymentType"); 
  const downPaymentPercentage = form.watch("downPaymentPercentage");
  const downPaymentFixed = form.watch("downPaymentFixed");
  const watchedInstallmentMonths = form.watch("installmentMonths");

  useEffect(() => {
    const parsedSize = parseFloat(String(sizeSqMeters));
    const parsedPrice = parseFloat(String(pricePerSqMeter));

    if (isNaN(parsedSize) || isNaN(parsedPrice) || parsedSize <= 0 || parsedPrice <= 0) {
      setCalculations(initialCalculations);
      return;
    }

    const totalPrice = parsedSize * parsedPrice;

    let discount = 0;
    let discountPercentageVal = 0;
    
    let potentialDownPaymentForDiscountTier = 0;
    // Calculate potential down payment based on the TOTAL price *before* discount for discount tier evaluation
    if (watchedDownPaymentType === 'percentage') {
        const parsedDpPercentage = parseFloat(String(downPaymentPercentage));
        if (!isNaN(parsedDpPercentage) && parsedDpPercentage >= 0 && parsedDpPercentage <= 100) {
            potentialDownPaymentForDiscountTier = (parsedDpPercentage / 100) * totalPrice; 
        }
    } else { 
        const parsedDpFixed = parseFloat(String(downPaymentFixed));
        if (!isNaN(parsedDpFixed) && parsedDpFixed >= 0) {
            potentialDownPaymentForDiscountTier = parsedDpFixed;
        }
    }
    
    if (totalPrice > 0) { 
        if (potentialDownPaymentForDiscountTier >= totalPrice) { // 100% down payment
            discount = 0.07 * totalPrice; 
            discountPercentageVal = 7;
        } else if (potentialDownPaymentForDiscountTier >= 0.5 * totalPrice) { // 50% or more down payment
            discount = 0.03 * totalPrice; 
            discountPercentageVal = 3;
        }
    }
    
    const totalPriceAfterDiscount = totalPrice - discount;

    let actualDownPaymentAmount = 0;
    // Calculate actual down payment based on the price *after* discount
    if (watchedDownPaymentType === 'percentage') {
      const parsedDpPercentage = parseFloat(String(downPaymentPercentage));
      if (!isNaN(parsedDpPercentage) && parsedDpPercentage >= 0 && parsedDpPercentage <= 100) {
        actualDownPaymentAmount = (parsedDpPercentage / 100) * totalPriceAfterDiscount;
      }
    } else { 
      const parsedDpFixed = parseFloat(String(downPaymentFixed));
      if (!isNaN(parsedDpFixed) && parsedDpFixed >= 0) {
        actualDownPaymentAmount = parsedDpFixed;
      }
    }
    actualDownPaymentAmount = Math.max(0, actualDownPaymentAmount);
    actualDownPaymentAmount = Math.min(actualDownPaymentAmount, totalPriceAfterDiscount);

    const remainingAmount = totalPriceAfterDiscount - actualDownPaymentAmount;
    const currentInstallmentMonths = Number(watchedInstallmentMonths) || 0;
    const monthlyInstallment = currentInstallmentMonths > 0 && remainingAmount > 0 ? remainingAmount / currentInstallmentMonths : 0;

    setCalculations({
      totalPrice: totalPrice,
      discountApplied: discount,
      discountPercentageVal: discountPercentageVal,
      totalPriceAfterDiscount: totalPriceAfterDiscount,
      downPaymentAmount: actualDownPaymentAmount,
      remainingAmount: Math.max(0, remainingAmount),
      monthlyInstallment: Math.max(0, monthlyInstallment),
    });
  }, [
    sizeSqMeters, 
    pricePerSqMeter, 
    watchedDownPaymentType, 
    downPaymentPercentage, 
    downPaymentFixed, 
    watchedInstallmentMonths
  ]);

  const handlePrint = () => {
    window.print();
  };
  
  const downPaymentTypeForConditionalRender = form.watch("downPaymentType");

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => {})} className="space-y-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-9">
            <div className="lg:col-span-4 space-y-6">
              <Card className="shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl text-primary">{t('formTitle')}</CardTitle>
                    <div className="flex items-center space-x-2">
                       <LanguageSwitcher />
                       <CurrencySwitcher />
                    </div>
                  </div>
                  <CardDescription>{t('formDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="apartmentBlock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Building className="mr-2 h-4 w-4 text-primary" />{t('apartmentBlockLabel')}</FormLabel>
                        <FormControl><Input placeholder={t('apartmentBlockPlaceholder')} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="floor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Layers className="mr-2 h-4 w-4 text-primary" />{t('floorLabel')}</FormLabel>
                          <FormControl><Input type="number" placeholder={t('floorPlaceholder')} {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="apartmentNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><DoorOpen className="mr-2 h-4 w-4 text-primary" />{t('apartmentNumberLabel')}</FormLabel>
                          <FormControl><Input type="number" placeholder={t('apartmentNumberPlaceholder')} {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numberOfRooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><BedDouble className="mr-2 h-4 w-4 text-primary" />{t('numberOfRoomsLabel')}</FormLabel>
                          <FormControl><Input type="number" placeholder={t('numberOfRoomsPlaceholder')} {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="sizeSqMeters"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Square className="mr-2 h-4 w-4 text-primary" />{t('sizeSqMetersLabel')}</FormLabel>
                          <FormControl><Input type="number" placeholder={t('sizeSqMetersPlaceholder')} {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pricePerSqMeter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><CircleDollarSign className="mr-2 h-4 w-4 text-primary" />{t('pricePerSqMeterLabel')} ({currency})</FormLabel>
                        <FormControl><Input type="number" placeholder={t('pricePerSqMeterPlaceholder')} {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 
                  <Separator />

                  <FormField
                    control={form.control}
                    name="downPaymentType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="flex items-center"><Landmark className="mr-2 h-4 w-4 text-primary" />{t('downPaymentTypeLabel')}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="percentage" id="dpTypePercentage" /></FormControl>
                              <FormLabel htmlFor="dpTypePercentage" className="font-normal">{t('downPaymentTypePercentage')}</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="fixed" id="dpTypeFixed" /></FormControl>
                              <FormLabel htmlFor="dpTypeFixed" className="font-normal">{t('downPaymentTypeFixed')} ({currency})</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {downPaymentTypeForConditionalRender === 'percentage' && (
                    <FormField
                      control={form.control}
                      name="downPaymentPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('downPaymentPercentageLabel')}</FormLabel>
                          <FormControl><Input type="number" placeholder={t('downPaymentPercentagePlaceholder')} {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {downPaymentTypeForConditionalRender === 'fixed' && (
                    <FormField
                      control={form.control}
                      name="downPaymentFixed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('downPaymentFixedLabel')} ({currency})</FormLabel>
                          <FormControl><Input type="number" placeholder={t('downPaymentFixedPlaceholder')} {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="installmentMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-primary" />{t('installmentMonthsLabel')}</FormLabel>
                        <Select 
                            onValueChange={(value) => field.onChange(Number(value))} 
                            value={String(field.value)}
                        >
                          <FormControl><SelectTrigger><SelectValue placeholder={t('selectMonthsPlaceholder')} /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="12">{t('months12')}</SelectItem>
                            <SelectItem value="24">{t('months24')}</SelectItem>
                            <SelectItem value="36">{t('months36')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <Button type="button" onClick={handlePrint} className="w-full no-print mt-6">
                    <Printer className="mr-2 h-4 w-4" /> {t('printButtonText')}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8 mt-8 lg:mt-0 no-print">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">{t('previewTitle')}</CardTitle>
                  <CardDescription>{t('previewDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-250px)] w-full rounded-md border border-border bg-muted/30">
                    <div className="p-1 sm:p-2 md:p-4 min-w-[210mm] mx-auto"> {/* Ensure enough width for A4 content */}
                      <PrintablePage formData={form.getValues()} calculations={calculations} />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
      <div className="hidden print:block">
         <PrintablePage formData={form.getValues()} calculations={calculations} />
      </div>
    </div>
  );
}
