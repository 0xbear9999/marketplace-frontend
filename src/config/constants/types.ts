type LinkOfTextAndLink = string | { text: string; url: string };
type DeviceLink = {
  desktop?: LinkOfTextAndLink;
  mobile?: LinkOfTextAndLink;
};
type LinkOfDevice = string | DeviceLink;

export type WalletConfig<T = unknown> = {
  id: string;
  title: string;
  description: string;
  icon: string;
  connectorId: T;
  deepLink?: string;
  installed?: boolean;
  guide?: LinkOfDevice;
  downloadLink?: LinkOfDevice;
  mobileOnly?: boolean;
};
