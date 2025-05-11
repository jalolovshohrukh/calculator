import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center space-x-2">
      <span className="font-bold text-lg text-primary">CITY PARK</span>
    </div>
  );
}
