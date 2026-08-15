import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

export interface ShippingEmailProps {
  customerName?: string | null
  orderNumber: string
  carrierLabel?: string | null
  trackingNumber?: string | null
  trackingUrl?: string | null
  items: Array<{ description: string; quantity: number }>
}

export const ShippingEmail = ({
  customerName,
  orderNumber,
  carrierLabel,
  trackingNumber,
  trackingUrl,
  items,
}: ShippingEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Fay&apos;s Kitchen order {orderNumber} has shipped</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your order is on its way</Heading>
        <Text style={text}>
          {customerName ? `Hi ${customerName},` : 'Hi,'} great news — order{' '}
          <strong>{orderNumber}</strong> has shipped.
        </Text>
        {trackingNumber ? (
          <Text style={text}>
            Carrier: <strong>{carrierLabel ?? 'Carrier'}</strong>
            <br />
            Tracking number: <strong>{trackingNumber}</strong>
          </Text>
        ) : null}
        {trackingUrl ? (
          <Button style={button} href={trackingUrl}>
            Track your package
          </Button>
        ) : null}
        {items.length ? (
          <Text style={text}>
            <strong>In this shipment</strong>
            <br />
            {items.map((i) => `${i.description} × ${i.quantity}`).join('\n')}
          </Text>
        ) : null}
        <Text style={footer}>
          Questions? Just reply to this email or write to Info@fayskitchen.com. Mèsi anpil!
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ShippingEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "Georgia, 'Times New Roman', serif",
}
const container = {
  padding: '32px 28px',
  maxWidth: '560px',
  border: '1px solid #EADFD3',
  borderRadius: '14px',
  borderTop: '6px solid #B85C38',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#3B2A20',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#6B5A4E',
  lineHeight: '1.6',
  margin: '0 0 22px',
  whiteSpace: 'pre-line' as const,
}
const button = {
  backgroundColor: '#B85C38',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = {
  fontSize: '12px',
  color: '#9A8B80',
  margin: '30px 0 0',
  borderTop: '1px solid #EADFD3',
  paddingTop: '16px',
}
