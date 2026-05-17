import { ServiceMode, ServiceProvider } from '../types/business';

export interface ServiceFeeCalculationResult {
  serviceMode: ServiceMode;
  serviceProviderId?: string;
  serviceProviderName?: string;
  serviceRate: number;
  serviceFee: number;
}

export function calculateFulfillmentServiceFee({
  factoryTotal,
  serviceMode,
  platformServiceRate = 20,
  selectedProvider
}: {
  factoryTotal: number;
  serviceMode: ServiceMode;
  platformServiceRate?: number;
  selectedProvider?: ServiceProvider;
}): ServiceFeeCalculationResult {
  let serviceRate = 0;
  let serviceFee = 0;
  let serviceProviderId: string | undefined;
  let serviceProviderName: string | undefined;

  if (serviceMode === 'self_service') {
    serviceRate = 0;
    serviceFee = 0;
  } else if (serviceMode === 'platform_standard') {
    serviceRate = platformServiceRate;
    serviceFee = (factoryTotal * serviceRate) / 100;
  } else if (serviceMode === 'regional_provider' && selectedProvider) {
    serviceRate = selectedProvider.service_rate;
    // Ensure regional_provider.serviceRate >= platformServiceRate
    const actualRate = Math.max(serviceRate, platformServiceRate);
    serviceRate = actualRate;
    serviceFee = (factoryTotal * serviceRate) / 100;
    serviceProviderId = selectedProvider.id;
    serviceProviderName = selectedProvider.name;
  }

  return {
    serviceMode,
    serviceProviderId,
    serviceProviderName,
    serviceRate,
    serviceFee
  };
}
