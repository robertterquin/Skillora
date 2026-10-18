/** The public credential number for a certificate, derived from its share code. */
export function credentialId(shareToken: string): string;
export function credentialId(shareToken: string | undefined): string | undefined;
export function credentialId(shareToken: string | undefined): string | undefined {
  return shareToken ? `SK-${shareToken.slice(0, 8).toUpperCase()}` : undefined;
}
