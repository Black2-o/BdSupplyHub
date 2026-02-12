import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="border-2 border-black overflow-hidden bg-white">
      <div className="aspect-square bg-secondary overflow-hidden relative">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4 mb-2" /> {/* Category */}
        <Skeleton className="h-6 w-full" /> {/* Product Name */}
        <div className="pt-2 border-t border-gray-200 space-y-2">
          <Skeleton className="h-6 w-1/2" /> {/* Price */}
          <Skeleton className="h-4 w-1/4" /> {/* MOQ */}
        </div>
      </div>
    </div>
  );
}
