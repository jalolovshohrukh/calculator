import { EstateCalcForm } from '@/components/estate-calc-form';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground py-8">
      <EstateCalcForm />
    </main>
  );
}
