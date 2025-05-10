
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
  const form = useForm<ApartmentCalcFormValues>({
    resolver: zodResolver(apartmentCalcSchema),
    defaultValues: {
      apartmentBlock: 'A1',
      floor: 1,
      apartmentNumber: 101,
      sizeSqMeters: 80,
      pricePerSqMeter: 500,
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
    
    // Calculate discount based on the *intended* down payment amount (before discount is applied to total price)
    let intendedDownPaymentRatio = 0;
    if (watchedDownPaymentType === 'percentage') {
      const parsedDpPercentage = parseFloat(String(downPaymentPercentage));
      if (!isNaN(parsedDpPercentage) && parsedDpPercentage >= 0 && parsedDpPercentage <= 100) {
        intendedDownPaymentRatio = parsedDpPercentage / 100;
      }
    } else { // 'fixed'
      const parsedDpFixed = parseFloat(String(downPaymentFixed));
      if (!isNaN(parsedDpFixed) && parsedDpFixed >= 0 && totalPrice > 0) {
        intendedDownPaymentRatio = parsedDpFixed / totalPrice;
      } else if (!isNaN(parsedDpFixed) && parsedDpFixed >=0 && totalPrice === 0) {
        // If total price is 0, any positive fixed payment is like 100% for discount purposes
        intendedDownPaymentRatio = 1;
      }
    }
    
    if (intendedDownPaymentRatio >= 1) { // 100% or more of original price
      discount = 0.07 * totalPrice;
      discountPercentageVal = 7;
    } else if (intendedDownPaymentRatio >= 0.5) { // 50% to 99.99% of original price
      discount = 0.03 * totalPrice;
      discountPercentageVal = 3;
    }
    
    const totalPriceAfterDiscount = totalPrice - discount;

    let actualDownPaymentAmount = 0;
    if (watchedDownPaymentType === 'percentage') {
      const parsedDpPercentage = parseFloat(String(downPaymentPercentage));
      if (!isNaN(parsedDpPercentage) && parsedDpPercentage >= 0 && parsedDpPercentage <= 100) {
        actualDownPaymentAmount = (parsedDpPercentage / 100) * totalPriceAfterDiscount;
      }
    } else { // 'fixed'
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
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Form Inputs Column */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Property & Payment Details</CardTitle>
                  <CardDescription>Enter the details to calculate your payment plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="apartmentBlock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Building className="mr-2 h-4 w-4 text-primary" />Apartment Block</FormLabel>
                        <FormControl><Input placeholder="e.g., A1" {...field} /></FormControl>
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
                          <FormLabel className="flex items-center"><Layers className="mr-2 h-4 w-4 text-primary" />Floor</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 2" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="apartmentNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><DoorOpen className="mr-2 h-4 w-4 text-primary" />Apartment No.</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 204" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
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
                          <FormLabel className="flex items-center"><BedDouble className="mr-2 h-4 w-4 text-primary" />Number of Rooms</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 3" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="sizeSqMeters"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Square className="mr-2 h-4 w-4 text-primary" />Size (sq. meters)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 80" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
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
                        <FormLabel className="flex items-center"><CircleDollarSign className="mr-2 h-4 w-4 text-primary" />Price per sq. meter</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 500" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
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
                        <FormLabel className="flex items-center"><Landmark className="mr-2 h-4 w-4 text-primary" />Down Payment Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="percentage" id="dpTypePercentage" /></FormControl>
                              <FormLabel htmlFor="dpTypePercentage" className="font-normal">Percentage (%)</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="fixed" id="dpTypeFixed" /></FormControl>
                              <FormLabel htmlFor="dpTypeFixed" className="font-normal">Fixed Amount (UZS)</FormLabel>
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
                          <FormLabel>Down Payment Percentage</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 30" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
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
                          <FormLabel>Down Payment Fixed Amount</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 12000000" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl>
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
                        <FormLabel className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-primary" />Installment Months</FormLabel>
                        <Select 
                            onValueChange={(value) => field.onChange(Number(value))} 
                            value={String(field.value)}
                        >
                          <FormControl><SelectTrigger><SelectValue placeholder="Select months" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="12">12 Months</SelectItem>
                            <SelectItem value="24">24 Months</SelectItem>
                            <SelectItem value="36">36 Months</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <Button type="button" onClick={handlePrint} className="w-full no-print mt-6">
                    <Printer className="mr-2 h-4 w-4" /> Print Quotation
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-7 mt-8 lg:mt-0 no-print">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Quotation Preview</CardTitle>
                  <CardDescription>This is how your printable quotation will look.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[70vh] w-full rounded-md border border-border p-1 bg-muted/30">
                     <PrintablePage formData={form.getValues()} calculations={calculations} />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
      {/* Hidden div for actual printing */}
      <div className="hidden print:block">
         <PrintablePage formData={form.getValues()} calculations={calculations} />
      </div>
    </div>
  );
}

    
