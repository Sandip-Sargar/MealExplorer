import React from 'react';
import { Utensils } from './Icons';

export const Loading = () => (
  <div className="flex flex-col items-center justify-center h-64 w-full text-orange-500 animate-pulse">
    <Utensils className="w-12 h-12 mb-4 animate-bounce" />
    <span className="font-medium text-lg">Preparing ingredients...</span>
  </div>
);