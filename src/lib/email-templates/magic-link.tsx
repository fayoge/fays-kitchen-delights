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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your login link for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your login link</Heading>
        <Text style={text}>
          Click the button below to log in to {siteName}. This link will expire
          shortly.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Log In
        </Button>
        <Text style={footer}>
          If you didn't request this link, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
  lineHeight: '1.5',
  margin: '0 0 25px',
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
